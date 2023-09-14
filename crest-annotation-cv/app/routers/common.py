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
                {"id": "facebook-sam", "name": "Segment Anything (Meta AI)"},
                {"id": "example-segment", "name": "Square (Example)"},
            ]
        }
    )
