import numpy as np
import cv2

from fastapi import UploadFile, Body, File
from fastapi.responses import JSONResponse
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
    x: int
    y: int


@router.post("/prepare")
async def prepare(file: UploadFile = File()):
    # TODO: make reusable
    py_data = bytearray(await file.read())
    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.CV_LOAD_IMAGE_UNCHANGED)
    predictor.set_image(cv_data)


@router.post("/preview")
async def preview(cursor: Position = Body(alias="cursor")):
    input_point = np.array([[cursor.x, cursor.y]])
    input_label = np.array([1])

    masks, _, _ = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=False,
    )

    return JSONResponse({"mask": masks[0]})


@router.post("/run")
async def run(cursor: Position = Body(alias="cursor")):
    input_point = np.array([[cursor.x, cursor.y]])
    input_label = np.array([1])

    masks, _, _ = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=False,
    )

    return JSONResponse({"mask": masks[0]})
