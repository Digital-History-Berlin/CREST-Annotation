import os
import json
import logging
import numpy as np
import cv2

from urllib import request
from fastapi import Body, Depends
from fastapi.responses import FileResponse, Response

from segment_anything import SamPredictor

from app.schemas.common import Position
from app.dependencies.facebook_sam import get_sam_model
from . import router


# cached ONNX model and predictor
predictor = None
cache_index = None
# TODO: specify cache directory from environment
embeddings_path = "./cache/facebook_sam_onnx/embeddings/"
embedding_path = "./cache/facebook_sam_onnx/embedding.npy"


@router.get("/onnx")
def get_onnx():
    return FileResponse(
        "./models/sam_vit_h_4b8939.onnx",
        media_type="application/wasm",
    )


@router.get("/onnx-quantized")
def get_onnx_quantized():
    return FileResponse(
        "./models/sam_vit_h_4b8939_quantized.onnx",
        media_type="application/wasm",
    )


@router.get("/embeddings")
def get_embeddings():
    return FileResponse(
        embedding_path,
        media_type="application/octet-stream",
    )


@router.post("/prepare")
async def prepare(url: str | None = Body(embed=True), sam=Depends(get_sam_model)):
    global predictor
    global cache_index

    if cache_index == url:
        logging.info("Model cached")
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
        predictor = SamPredictor(sam)

    np_data = np.asarray(py_data, dtype=np.uint8)
    cv_data = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    predictor.set_image(cv_data)
    embedding = predictor.get_image_embedding().cpu().numpy()

    os.makedirs(embeddings_path, exist_ok=True)
    np.save(embedding_path, embedding)
    cache_index = url


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
