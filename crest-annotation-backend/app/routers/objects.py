import json

from typing import Callable

from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from ..dependencies.db import get_db, get_paginate
from ..models.objects import Object
from .. import schemas

from ..api import get_object_data_schema

router = APIRouter(
    prefix="/objects",
    tags=["object"],
    responses={404: {"description": "Not found"}},
)


def to_schema(data_object: Object) -> schemas.Object:
    return schemas.Object(
        id=data_object.id,
        object_uuid=data_object.object_uuid,
        annotated=data_object.annotated,
        annotation_data=data_object.annotation_data,
    )


def to_dict(data_object: Object):
    return to_schema(data_object).dict()


@router.get("/random-of/{project_id}", response_model=schemas.Object)
async def get_random_object(project_id: str, db: Session = Depends(get_db)):
    data_object: Object = (
        db.query(Object).filter_by(project_id=project_id, annotated=False).first()
    )
    if not data_object:
        raise HTTPException(status_code=404, detail="No objects found")

    return JSONResponse(to_dict(data_object))


@router.get("/of/{project_id}", response_model=list[schemas.Object])
async def get_objects(
    project_id: str,
    paginate: Callable = Depends(get_paginate),
    db: Session = Depends(get_db),
):
    objects: schemas.Paginated[schemas.Object] = paginate(
        db.query(Object).filter_by(project_id=project_id), to_schema
    )

    return JSONResponse(objects.dict())


@router.get("/id/{object_id}")
async def get_object(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return JSONResponse(to_dict(data_object))


@router.post("/finish/{object_id}")
async def finish_object(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    data_object.annotated = True
    db.commit()

    return Response()


@router.post("/uri/{object_id}")
async def get_image_uri(
    object_id: str, usage: schemas.ImageRequest, db: Session = Depends(get_db)
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    object_data = json.loads(data_object.object_data)
    schema = get_object_data_schema(object_data)
    data = schema(**object_data)

    return JSONResponse(data.get_image_uri(usage))


@router.get("/annotations/{object_id}")
async def get_annotations(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    print(data_object.id, data_object.annotation_data)

    return JSONResponse(data_object.annotation_data)


@router.post("/annotations/{object_id}")
async def store_annotations(
    object_id: str, annotation_data: str = Body(), db: Session = Depends(get_db)
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    data_object.annotated = False
    data_object.annotation_data = annotation_data
    db.commit()

    print(data_object.id, data_object.annotation_data)

    return Response()
