import requests
import json

from iiif_prezi3 import Manifest

from pydantic import ValidationError
from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.logger import get_logger
from app.models.projects import Project
from app.models.objects import Object

from .. import import_router as router

from .dependencies import Iiif3, Iiif3Import, Iiif3Object


def map_object(project_id: str, object: Iiif3Object) -> Object:
    return Object(
        project_id=project_id,
        object_uuid=object.object_uuid,
        object_data=object.object_data.json(),
    )


@router.post("/iiif/3", response_model=Iiif3Import)
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
        logger.exception("Invalid manifest")
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
        Iiif3Import(
            title=dict(manifest.label),
            display=str(manifest.behavior),
            objects=objects,
            added=added,
            problems=problems,
        ).dict()
    )
