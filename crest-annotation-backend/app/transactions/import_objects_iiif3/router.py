import requests
import json

from iiif_prezi3 import Manifest

from pydantic import ValidationError
from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ...dependencies.db import get_db
from ...dependencies.logger import get_logger
from ...models.projects import Project
from ...models.objects import Object

from .. import import_router as router

from .dependencies import Iiif3
from . import schemas


def map_image(project_id, *args, object_data, **kwargs):
    return Object(
        project_id=project_id,
        object_data=json.dumps(object_data),
        **kwargs,
    )


@router.post("/iiif/3", response_model=schemas.Iiif3Import)
async def import_iiif3(
    url: str,
    project_id: str,
    commit: bool = False,
    iiif: Iiif3 = Depends(Iiif3),
    db: Session = Depends(get_db),
    logger=Depends(get_logger),
):
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    logger.info(f"pulling IIIF manifest from {url}")
    manifest_json = requests.get(url).json()

    problems = []

    try:
        manifest = Manifest(**manifest_json)
    except ValidationError as e:
        logger.exception()
        # TODO: improve error message
        problems.append(str(e))
        # try to disable validation to be able to proceed
        manifest = Manifest.construct(**manifest_json)

    images = iiif.extract_images(manifest)

    # compare against known images
    query = db.query(Object.uri).filter_by(project_id=project_id)
    known = set(image.uri for image in query)
    added = list(image for image in images if image["uri"] not in known)

    # insert new objects
    if commit:
        db.add_all(map(lambda image: map_image(project_id, **image), images))
        db.commit()

    return JSONResponse(
        {
            "title": manifest.label,
            "display": manifest.behavior,
            "images": images,
            "added": added,
            "problems": problems,
        }
    )
