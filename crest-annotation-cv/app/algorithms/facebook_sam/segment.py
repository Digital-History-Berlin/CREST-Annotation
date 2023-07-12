import json
import logging
import numpy as np
import cv2

from urllib import request
from fastapi import Body
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

from segment_anything import SamPredictor, sam_model_registry

from . import router

# TODO: configuration
sam_checkpoint = "./models/sam_vit_h_4b8939.pth"
model_type = "vit_h"

device = "cuda"

# TODO: do this when neccessary
sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
sam.to(device=device)

predictor = SamPredictor(sam)


# TODO: make reusable
class Position(BaseModel):
    x: float
    y: float


@router.post("/prepare")
async def prepare(url: str | None = Body(embed=True)):
    # TODO: make reusable
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
