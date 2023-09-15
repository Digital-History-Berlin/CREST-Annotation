import json
import logging
import numpy as np
import cv2

from urllib import request
from fastapi import Body
from fastapi.responses import Response

from segment_anything import SamPredictor, sam_model_registry

from app.environment import env
from app.schemas.common import Position
from . import router

# TODO: this will initialize SAM on startup
# maybe implement some lazy loading
sam = sam_model_registry[env.sam_model_type](checkpoint=env.sam_checkpoint)

if env.sam_device:
    # if no device is specified leave on CPU
    sam.to(device=env.sam_device)

predictor = SamPredictor(sam)
cache_index = None


@router.post("/prepare")
async def prepare(url: str | None = Body(embed=True)):
    global cache_index
    
    if(cache_index == url):
        logging.info('Image cached')
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
    predictor.set_image(cv_data)

    cache_index = url


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
