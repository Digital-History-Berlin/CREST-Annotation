import requests
import json

from pydantic import ValidationError
from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ...dependencies.db import get_db
from ...dependencies.logger import get_logger
from ...models.projects import Project
from ...models.objects import Object

from .. import import_router as router

from .dependencies import Iiif2, Iiif2Object, Iiif2Import
from .schemas import Manifest


def map_object(project_id: str, object: Iiif2Object) -> Object:
    return Object(
        project_id=project_id,
        object_uuid=object.object_uuid,
        object_data=object.object_data.json(),
    )


@router.post("/iiif/2", response_model=Iiif2Import)
async def import_iiif2(
    url: str,
    project_id: str,
    commit: bool = False,
    iiif: Iiif2 = Depends(Iiif2),
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
        Iiif2Import(
            title=manifest.label,
            objects=objects,
            added=added,
            problems=problems,
        ).dict()
    )
