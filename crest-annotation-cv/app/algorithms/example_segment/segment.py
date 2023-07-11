import logging
import numpy as np
import cv2

from fastapi import UploadFile, Body, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import router

# TODO: make reusable
class Position(BaseModel):
    x: int
    y: int


class Predictor:
    def __init__(self):
        self.cv_data = None

    def set_image(self, image):
        self.cv_data = image

    def predict(self, position):
        # mask no pixels by default
        mask = np.zeros(self.cv_data.shape)
        # mask all pixels around cursor
        mask[position.x - 10 : position.x + 10, position.y - 10 : position.y + 10] = 1

        return mask


predictor = Predictor()


@router.post("/prepare")
async def prepare(file: UploadFile = File()):
    global cv_data

    # TODO: make reusable
    py_data = bytearray(await file.read())
    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.CV_LOAD_IMAGE_UNCHANGED)
    predictor.set_image(cv_data)


@router.post("/preview")
async def preview(cursor: Position = Body(alias="cursor")):
    mask = predictor.predict(cursor)

    return JSONResponse({"mask": mask})


@router.post("/run")
async def run(cursor: Position = Body(alias="cursor")):
    mask = predictor.predict(cursor)

    return JSONResponse({"mask": mask})
