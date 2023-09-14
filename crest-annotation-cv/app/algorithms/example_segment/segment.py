import logging
import json
import numpy as np
import cv2

from urllib import request
from fastapi import Body
from fastapi.responses import Response

from app.schemas.common import Position
from . import router


class Predictor:
    def __init__(self):
        self.cv_data = None

    def set_image(self, image):
        self.cv_data = image

    def predict(self, x: int, y: int):
        # mask no pixels by default
        mask = np.zeros(self.cv_data.shape[0:2])
        # mask all pixels around cursor
        mask[y - 100 : y + 100, x - 100 : x + 100] = 1

        return mask


predictor = Predictor()


@router.post("/prepare")
async def prepare(url: str | None = Body(embed=True)):
    if url:
        response = request.urlopen(url)
        py_data = bytearray(response.read())
    else:
        raise Exception("Invalid request")

    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.IMREAD_COLOR)

    predictor.set_image(cv_data)


@router.post("/preview")
async def preview(cursor: Position = Body(embed=True)):
    mask = predictor.predict(int(cursor.x), int(cursor.y))
    content = json.dumps({"mask": mask.tolist()})

    return Response(content=content, media_type="application/json")


@router.post("/run")
async def run(cursor: Position = Body(embed=True)):
    mask = predictor.predict(int(cursor.x), int(cursor.y))
    content = json.dumps({"mask": mask.tolist()})

    return Response(content=content, media_type="application/json")
