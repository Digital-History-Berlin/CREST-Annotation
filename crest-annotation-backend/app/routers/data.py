import os

from glob import iglob
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..dependencies.settings import Settings
from ..dependencies.logger import get_logger

router = APIRouter(
    prefix='/data',
    tags=['data'],
    responses={404: {"description": "Not found"}},
)


@router.get("/random")
async def get_random(settings=Depends(Settings), logger=Depends(get_logger)):
    base = settings.get('path')
    pattern = os.path.join(base, '*')

    logger.info(f'searching {pattern}')

    # TODO: match files against database
    for file in iglob(pattern):
        logger.info(f'found {file}')

        return FileResponse(file)

    raise HTTPException(status_code=404, detail="No images available")
