import json
import logging

from typing import Callable

from fastapi import APIRouter, Depends, Body, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse, Response
from sqlalchemy.orm import Session

from ..environment import env
from ..dependencies.db import get_db, get_paginate
from ..dependencies.cache import Cache
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


# use post to avoid RTK-query caching
@router.post("/random-of/{project_id}", response_model=schemas.Object)
async def get_random_object(
    project_id: str,
    filters: schemas.ObjectFilters = Depends(),
    offset: int | None = Query(),
    db: Session = Depends(get_db),
):
    query = db.query(Object).filter_by(project_id=project_id)
    if filters.annotated is not None:
        query = query.filter_by(annotated=filters.annotated)
    data_object: Object = query.offset(offset or 0).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="No objects found")

    return JSONResponse(to_dict(data_object))


@router.get("/total-of/{project_id}")
async def get_objects_count(project_id: str, db: Session = Depends(get_db)):
    total = db.query(Object).filter_by(project_id=project_id)
    annotated = total.filter_by(annotated=True)

    return JSONResponse(
        {
            "total": total.count(),
            "annotated": annotated.count(),
        }
    )


@router.get("/of/{project_id}", response_model=list[schemas.Object])
async def get_objects(
    project_id: str,
    filters: schemas.ObjectFilters = Depends(),
    paginate: Callable = Depends(get_paginate),
    db: Session = Depends(get_db),
):
    query = db.query(Object).filter_by(project_id=project_id)
    if filters.annotated is not None:
        query = query.filter_by(annotated=filters.annotated)
    objects: schemas.Paginated[schemas.Object] = paginate(query, to_schema)

    return JSONResponse(objects.dict())


@router.get("/id/{object_id}")
async def get_object(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return JSONResponse(to_dict(data_object))


@router.post("/finish/{object_id}")
async def finish_object(
    object_id: str, finished: bool = True, db: Session = Depends(get_db)
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    data_object.annotated = finished
    db.commit()

    return Response()


@router.post("/uri/{object_id}")
async def get_image_uri(
    object_id: str,
    usage: schemas.ImageRequest,
    db: Session = Depends(get_db),
    cache: Cache = Depends(Cache),
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    object_data = json.loads(data_object.object_data)
    schema = get_object_data_schema(object_data)
    data = schema(**object_data)
    uri = data.get_image_uri(usage)

    # inject cache if enabled
    if env.image_cache:
        uri = f"{env.image_cache_url}/{cache.encode(uri)}"

    return JSONResponse(uri)


@router.get("/cache/{encoded}")
async def get_cached_image(encoded: str, cache: Cache = Depends(Cache)):
    return FileResponse(cache.get(encoded))


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

    data_object.annotated = False
    data_object.annotation_data = annotation_data
    db.commit()

    return Response()
