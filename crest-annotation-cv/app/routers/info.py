from enum import auto

from fastapi import APIRouter
from fastapi.responses import JSONResponse


router = APIRouter()


@router.get("/info")
async def info():
    return JSONResponse(
        {
            # TODO: add more meta data if needed
            "algorithms": [
                # TODO: automatically gather algorithms
                {
                    "id": "facebook-sam-onnx",
                    "name": "Segment Anything (Meta AI) + ONNX",
                    "frontend": "sam-onnx",
                },
                {
                    "id": "facebook-sam",
                    "name": "Segment Anything (Meta AI)",
                    "frontend": "generic-single-mask",
                },
                {
                    "id": "example-segment",
                    "name": "Square (Example)",
                    "frontend": "generic-single-mask",
                },
                {
                    "id": "custom-crest-detection",
                    "name": "Crest Detection (Custom)",
                    "frontend": "crest-detection",
                },
            ]
        }
    )
