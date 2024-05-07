import json
import logging
import numpy as np
import cv2

from urllib import request
from fastapi import Body, Depends, HTTPException
from fastapi.responses import Response

from segment_anything import SamAutomaticMaskGenerator

from app.dependencies.facebook_sam import get_sam_model
from . import router


# cached SAM predictor
masks = None
cache_index = None


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
async def prepare(url: str | None = Body(embed=True), sam=Depends(get_sam_model)):
    global masks
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

    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.IMREAD_COLOR)

    logging.info("Preparing generator")
    generator = SamAutomaticMaskGenerator(sam)
    logging.info("Generating masks...")
    masks = generator.generate(cv_data)

    cache_index = url
