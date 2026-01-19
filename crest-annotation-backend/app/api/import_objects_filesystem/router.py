import json

from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.models.projects import Project
from app.models.objects import Object

from .. import import_router as router

from .dependencies import Filesystem, FilesystemObject, FilesystemImport


@router.post("/filesystem", response_model=FilesystemImport)
def import_filesystem(
    path: str,
    project_id: str,
    commit: bool = False,
    fs: Filesystem = Depends(Filesystem),
    db: Session = Depends(get_db),
):
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    objects = fs.extract_objects(path)

    # compare against known objects
    query = db.query(Object.object_data).filter_by(project_id=project_id)
    known = set(json.loads(obj.object_data).get("path") for obj in query)
    added = list(obj for obj in objects if obj.object_data.path not in known)
    count = len(known)

    # insert new objects
    if commit:
        db.add_all(
            Object(
                project_id=project_id,
                object_uuid=obj.object_uuid,
                position=count + i + 1,
                object_data=obj.object_data.json(),
            )
            for i, obj in enumerate(objects)
        )
        db.commit()

    return JSONResponse(
        FilesystemImport(
            objects=objects,
            added=added,
        ).dict()
    )
