import json
import logging
import numpy as np
import cv2
import torch

from urllib import request
from fastapi import Body, Depends
from fastapi.responses import Response

from sam2.sam2_image_predictor import SAM2ImagePredictor

from app.schemas.common import Position
from app.dependencies.facebook_sam import get_sam2_model
from . import router


# cached SAM predictor
predictor = None
cache_index = None


@torch.inference_mode()
@torch.autocast("cuda", dtype=torch.bfloat16)
@router.post("/prepare")
async def prepare(url: str | None = Body(embed=True), sam2=Depends(get_sam2_model)):
    global predictor
    global cache_index

    if cache_index == url:
        logging.info("Image cached")
        return

    if url:
        logging.info("Loading image...")
        response = request.urlopen(url)
        py_data = bytearray(response.read())
        logging.info("Image loaded")
    else:
        raise Exception("Invalid request")

    if predictor is None:
        logging.info("Creating predictor")
        predictor = SAM2ImagePredictor(sam2)

    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    predictor.set_image(cv_data)
    cache_index = url


@torch.inference_mode()
@torch.autocast("cuda", dtype=torch.bfloat16)
@router.post("/preview")
async def preview(cursor: Position = Body(embed=True)):
    input_point = np.array([[int(cursor.x), int(cursor.y)]])
    input_label = np.array([1])

    masks, _, _ = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=False,
    )

    content = json.dumps({"mask": masks[0].tolist()})

    return Response(content=content, media_type="application/json")


@torch.inference_mode()
@torch.autocast("cuda", dtype=torch.bfloat16)
@router.post("/run")
async def run(cursor: Position = Body(embed=True)):
    input_point = np.array([[int(cursor.x), int(cursor.y)]])
    input_label = np.array([1])

    masks, _, _ = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=False,
    )

    content = json.dumps({"mask": masks[0].tolist()})

    return Response(content=content, media_type="application/json")
