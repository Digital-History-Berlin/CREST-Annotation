import os
import json
import logging
import hashlib
import requests
import torch

import numpy as np
import cv2

from uuid import uuid4
from urllib import request

from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator
from sam2.sam2_image_predictor import SAM2Base

from fastapi import Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response

from app.schemas.common import TaskStatus
from app.dependencies.task_pool import get_task_manager
from app.dependencies.facebook_sam import get_sam2_model
from . import router


# cached SAM predictor
masks = None
cache_index = None
# TODO: specify cache directory from environment
segmentations_path = "./cache/custom_crest_detection/"
# TODO: configure from environment
backend = "http://localhost:8000"


@torch.inference_mode()
@torch.autocast("cuda", dtype=torch.bfloat16)
def run_segmentation(
    url: str,
    sam2: SAM2Base,
    logger: logging.Logger,
):
    hashed_url = hashlib.sha256(url.encode()).hexdigest()
    cache_path = segmentations_path + hashed_url + ".npy"
    if os.path.isfile(cache_path):
        logger.info("Loading existing segmentation...")
        masks = np.load(cache_path, allow_pickle=True)
        logger.info("Segmentation loaded")

        return masks

    if url:
        logger.info("Loading image...")
        response = request.urlopen(url)
        py_data = bytearray(response.read())
        logger.info("Image loaded")
    else:
        raise Exception("Invalid request")

    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.IMREAD_COLOR)

    logger.info("Preparing generator")
    generator = SAM2AutomaticMaskGenerator(sam2)
    logger.info("Generating masks...")
    masks = generator.generate(cv_data)

    logger.info("Storing segmentation...")
    os.makedirs(segmentations_path, exist_ok=True)
    np.save(cache_path, masks)

    return masks


# TODO: task manager and sam from dependencies
def segmentation_task(task: TaskStatus):
    task_manager = get_task_manager()
    logger = task_manager.get_logger(task.id)
    sam2 = get_sam2_model()

    logger.info(f"Task starting...")
    task_manager.update_status(task.id, "processing")
    try:
        uri_response = requests.post(
            f"{backend}/objects/uri/{task.object_id}",
            json={"height": 1024},
        )
        run_segmentation(uri_response.json(), sam2, logger)

        logger.info(f"Task completed")
        task_manager.update_status(task.id, "completed")

    except Exception:
        logger.exception(f"Task failed")
        task_manager.update_status(task.id, "failed")


@router.get("/bounding-boxes")
def get_bounding_boxes():
    global masks

    if masks is None:
        raise HTTPException(status_code=400, detail="Masks not generated")

    content = json.dumps(
        list(
            [
                {
                    "bbox": mask["bbox"],
                    "predictedIou": mask["predicted_iou"],
                    "stabilityScore": mask["stability_score"],
                }
                for mask in masks
            ]
        )
    )

    return Response(content=content, media_type="application/json")


@router.get("/mask/{mask_index}")
def get_mask(mask_index: int):
    global masks

    if masks is None:
        raise HTTPException(status_code=400, detail="Masks not generated")
    if mask_index < 0 or mask_index >= len(masks):
        raise HTTPException(status_code=400, detail="Invalid mask index")

    content = json.dumps({"mask": masks[mask_index]["segmentation"].tolist()})

    return Response(content=content, media_type="application/json")


@router.post("/prepare")
async def prepare(url: str | None = Body(embed=True), sam2=Depends(get_sam2_model)):
    global masks
    global cache_index

    if cache_index == url:
        logging.info("Image cached")
        return

    masks = run_segmentation(url, sam2, logging.root)
    cache_index = url


@router.post("/start/{task_id}/{project_id}")
async def start(task_id: str, project_id: str, task_manager=Depends(get_task_manager)):
    objects_response = requests.get(f"{backend}/objects/all-of/{project_id}")
    objects = objects_response.json()

    tasks = list(
        [
            TaskStatus(
                id=str(uuid4()),
                project_id=project_id,
                object_id=obj["id"],
                status="queued",
            )
            for obj in objects
        ]
    )

    logging.info(f"Queueing segmentation tasks: {tasks}")
    tasks = task_manager.queue_tasks(tasks, segmentation_task)

    return JSONResponse(jsonable_encoder(tasks))
