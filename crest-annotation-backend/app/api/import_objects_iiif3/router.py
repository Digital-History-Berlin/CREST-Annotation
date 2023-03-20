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


def map_object(project_id: str, object: schemas.Iiif3Object) -> Object:
    return Object(
        project_id=project_id,
        object_uuid=object.object_uuid,
        object_data=object.object_data,
        image_uri=object.image_uri,
        thumbnail_uri=object.thumbnail_uri,
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

    objects = iiif.extract_objects(manifest)

    # compare against known objects
    query = db.query(Object.object_uuid).filter_by(project_id=project_id)
    known = set(obj.object_uuid for obj in query)
    added = list(obj for obj in objects if obj.object_uuid not in known)

    # insert new objects
    if commit:
        db.add_all(map_object(project_id, obj) for obj in objects)
        db.commit()

    return JSONResponse(
        schemas.Iiif3Import(
            title=dict(manifest.label),
            display=str(manifest.behavior),
            objects=objects,
            added=added,
            problems=problems,
        ).dict()
    )
