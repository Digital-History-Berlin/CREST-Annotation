import json

from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from ..dependencies.db import get_db
from ..models.objects import Object
from .. import schemas

from .. import api

router = APIRouter(
    prefix="/objects",
    tags=["object"],
    responses={404: {"description": "Not found"}},
)


image_resolvers = {
    "iiif3": api.iiif3_image_resolver,
}


def map_object(data_object: Object):
    return schemas.Object(
        id=data_object.id,
        object_uuid=data_object.object_uuid,
        annotated=data_object.annotated,
        annotation_data=data_object.annotation_data,
    ).dict()


@router.get("/random-of/{project_id}", response_model=schemas.Object)
async def get_random_object(project_id: str, db: Session = Depends(get_db)):
    data_object: Object = (
        db.query(Object).filter_by(project_id=project_id, annotated=False).first()
    )
    if not data_object:
        raise HTTPException(status_code=404, detail="No objects found")

    return JSONResponse(map_object(data_object))


@router.get("/of/{project_id}", response_model=list[schemas.Object])
async def get_objects(project_id: str, db: Session = Depends(get_db)):
    objects: list[Object] = db.query(Object).filter_by(project_id=project_id)

    return JSONResponse(list(map(map_object, objects)))


@router.get("/id/{object_id}")
async def get_object(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return JSONResponse(map_object(data_object))


@router.post("/uri/{object_id}")
async def get_image_uri(
    object_id: str, usage: schemas.ImageRequest, db: Session = Depends(get_db)
):
    def resolve_uri(json_data):
        uri_data = json.loads(json_data)
        # plain URI can be directly returned
        if isinstance(uri_data, str):
            return uri_data
        # access resolver
        resolver = image_resolvers.get(uri_data.get("resolver"))
        if resolver is None:
            raise HTTPException(status_code=500, detail="Invalid image data")
        # process URI data
        return resolver(uri_data, usage)

    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    if usage.thumbnail and data_object.thumbnail_uri is not None:
        return JSONResponse(resolve_uri(data_object.thumbnail_uri))

    return JSONResponse(resolve_uri(data_object.image_uri))


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


@router.post("/finish/{object_id}")
async def finish_object(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    data_object.annotated = True
    db.commit()

    return Response()
