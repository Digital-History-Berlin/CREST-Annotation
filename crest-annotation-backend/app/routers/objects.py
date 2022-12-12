import os

from glob import iglob
from typing import List
from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse, FileResponse, Response
from sqlalchemy.orm import Session

from ..dependencies.logger import get_logger
from ..dependencies.db import get_db
from ..models.projects import Project
from ..models.objects import Object
from .. import schemas

router = APIRouter(
    prefix="/objects",
    tags=["object"],
    responses={404: {"description": "Not found"}},
)


def map_object(data_object: Object) -> schemas.Object:
    return {
        "id": data_object.id,
        "annotated": data_object.annotated,
        "annotation_data": data_object.annotation_data,
    }


@router.post("/collect-of/{project_id}")
async def collect_objects(
    project_id: str, db: Session = Depends(get_db), logger=Depends(get_logger)
):

    # get and validate the project
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # generate search pattern
    base = project.source
    pattern = os.path.join(base, "*")

    logger.info(f"searching {pattern}")

    # compare filesystem and database
    collected = set(iglob(pattern))
    known = set(db.query(Object.uri).filter_by(project_id=project_id))
    collectables = collected - known

    logger.info(f"found {len(collected)} objects")

    # insert new objects
    db.add_all(map(lambda file: Object(project_id=project_id, uri=file), collectables))
    db.commit()

    return JSONResponse(
        {
            "available": len(collected),
            "inserted": len(collectables),
        }
    )


@router.get("/random-of/{project_id}", response_model=schemas.Object)
async def get_random_object(project_id: str, db: Session = Depends(get_db)):
    data_object: Object = (
        db.query(Object).filter_by(project_id=project_id, annotated=False).first()
    )
    if not data_object:
        raise HTTPException(status_code=404, detail="No objects found")

    return JSONResponse(map_object(data_object))


@router.get("/of/{project_id}", response_model=List[schemas.Object])
async def get_objects(project_id: str, db: Session = Depends(get_db)):
    objects: List[Object] = db.query(Object).filter_by(project_id=project_id)

    return JSONResponse(list(map(map_object, objects)))


@router.get("/image/{object_id}")
async def get_image(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    # ensure that the image file is still available
    if not os.path.isfile(data_object.uri):
        raise HTTPException(status_code=404, detail="Image missing")

    return FileResponse(data_object.uri)


@router.get("/annotations/{object_id}")
async def get_annotations(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return JSONResponse(data_object.annotation_data)


@router.post("/annotations/{object_id}")
async def store_annotations(
    object_id: str, annotation_data: str = Body(), db: Session = Depends(get_db)
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    data_object.annotation_data = annotation_data
    db.commit()

    return Response()
