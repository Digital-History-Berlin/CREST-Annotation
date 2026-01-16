import json
import logging
import base64

from typing import Callable

from fastapi import APIRouter, Depends, Body, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse, Response
from sqlalchemy.orm import Session, aliased

from ..environment import env
from ..dependencies.db import get_db, get_paginate
from ..dependencies.cache import Cache
from ..models.objects import Object
from .. import schemas

from ..api import (
    get_object_image_uri,
    get_object_image_description,
    get_annotations_provider,
)
from ..models.projects import Project

router = APIRouter(
    prefix="/objects",
    tags=["object"],
    responses={404: {"description": "Not found"}},
)


def to_schema(data_object: Object) -> schemas.Object:
    return schemas.Object(
        id=data_object.id,
        object_uuid=data_object.object_uuid,
        position=data_object.position,
        annotated=data_object.annotated,
        annotation_data=data_object.annotation_data,
    )


def to_summary_schema(data_object: Object) -> schemas.SummaryObject:
    return schemas.SummaryObject(
        id=data_object.id,
        object_uuid=data_object.object_uuid,
        position=data_object.position,
        annotated=data_object.annotated,
    )


def with_filters(query, filters: schemas.ObjectFilters):
    if filters.annotated is not None:
        query = query.filter_by(annotated=filters.annotated)
    if filters.synced is not None:
        query = query.filter_by(synced=filters.synced)
    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.filter(
            Object.object_uuid.ilike(search_term)
            | Object.object_data.ilike(search_term)
        )
    return query


@router.get("/at/{project_id}", response_model=schemas.Object)
def get_object_at(
    project_id: str,
    filters: schemas.ObjectFilters = Depends(),
    offset: int | None = Query(default=0),
    db: Session = Depends(get_db),
):
    query = db.query(Object).filter_by(project_id=project_id)
    query = with_filters(query, filters)
    query = query.order_by(Object.position)

    total = query.count()
    data_object: Object = query.order_by(Object.position).offset(offset or 0).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="No objects found")

    return to_schema(data_object)


@router.get("/offset/{object_id}", response_model=schemas.ObjectNavigate)
def navigate_from(
    object_id: str,
    filters: schemas.ObjectFilters = Depends(),
    offset: int = Query(default=0),
    db: Session = Depends(get_db),
):
    if offset == 0:
        return schemas.ObjectNavigate(id=object_id)

    # self-join to find current object
    current = aliased(Object)
    query = db.query(Object).join(
        current,
        (Object.project_id == current.project_id) & (current.id == object_id),
    )
    query = with_filters(query, filters)

    # find next image
    if offset > 0:
        query = (
            query.filter(Object.position > current.position)
            .order_by(Object.position.asc())
            .offset(offset - 1)
        )

    # find previous image
    if offset < 0:
        query = (
            query.filter(Object.position < current.position)
            .order_by(Object.position.desc())
            .offset(-offset - 1)
        )

    # validate result
    data_object = query.first()
    if not data_object:
        raise HTTPException(status_code=404, detail="No objects match filters")

    print(str(query))
    return schemas.ObjectNavigate(id=data_object.id)


@router.get("/total-of/{project_id}", response_model=schemas.TotalOf)
def get_objects_count(project_id: str, db: Session = Depends(get_db)):
    total = db.query(Object).filter_by(project_id=project_id)
    annotated = total.filter_by(annotated=True)

    return schemas.TotalOf(
        total=total.count(),
        annotated=annotated.count(),
    )


@router.get("/of/{project_id}", response_model=schemas.Paginated[schemas.SummaryObject])
def get_objects(
    project_id: str,
    filters: schemas.ObjectFilters = Depends(),
    paginate: Callable = Depends(get_paginate),
    db: Session = Depends(get_db),
):
    query = db.query(Object).filter_by(project_id=project_id)
    query = with_filters(query, filters)
    query = query.order_by(Object.position)

    return paginate(query, to_summary_schema)


@router.get("/all-of/{project_id}", response_model=list[schemas.SummaryObject])
def get_all_objects(project_id: str, db: Session = Depends(get_db)):
    objects: list[schemas.Object] = db.query(Object).filter_by(project_id=project_id)

    return map(to_summary_schema, objects)


@router.get("/id/{object_id}", response_model=schemas.Object)
def get_object(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return to_schema(data_object)


@router.post("/finish/{object_id}")
def finish_object(object_id: str, finished: bool = True, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    data_object.annotated = finished
    data_object.locked = False
    db.commit()

    return Response()


@router.post("/lock/{object_id}/{session_id}")
def lock_object(
    object_id: str, session_id: str, force: bool = False, db: Session = Depends(get_db)
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    if force or data_object.locked_by is None:
        data_object.locked_by = session_id

    db.commit()

    return Response()


@router.post("/unlock/{object_id}")
def unlock_object(
    object_id: str, session_id: str | None = None, db: Session = Depends(get_db)
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    if session_id is None or data_object.locked_by == session_id:
        data_object.locked_by = None

    data_object.locked_by = None
    db.commit()

    return Response()


@router.get("/lock/{object_id}/{session_id}")
def get_lock_status(object_id: str, session_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return JSONResponse({"locked": data_object.locked_by == session_id})


@router.post("/uri/{object_id}")
def get_image_uri(
    object_id: str,
    usage: schemas.ImageRequest,
    db: Session = Depends(get_db),
    cache: Cache = Depends(Cache),
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    # disable caching for local files
    image_uri = get_object_image_uri(data_object, usage)
    local = image_uri.lower().startswith(env.image_local_url.lower())

    # inject cache if enabled
    if not local and env.image_cache:
        uri = f"{env.image_cache_url}/{cache.encode(object_id, usage)}"
        return JSONResponse(uri)

    return JSONResponse(image_uri)


@router.get("/describe/{object_id}")
def get_image_description(
    object_id: str,
    db: Session = Depends(get_db),
    cache: Cache = Depends(Cache),
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    description = get_object_image_description(data_object)
    return JSONResponse(description)


@router.get("/cache/{encoded}")
def get_cached_image(
    encoded: str, db: Session = Depends(get_db), cache: Cache = Depends(Cache)
):
    # lazily resolve missed object
    def resolve(object_id: str, usage: schemas.ImageRequest):
        data_object: Object = db.query(Object).filter_by(id=object_id).first()
        if not data_object:
            raise HTTPException(status_code=404, detail="Object not found")

        return get_object_image_uri(data_object, usage)

    return FileResponse(cache.get(encoded, resolve))


@router.get("/local/{encoded}")
def get_local_image(encoded: str):
    decoded = base64.b32decode(encoded).decode()

    return FileResponse(decoded)


@router.get("/annotations/{object_id}")
def get_annotations(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    return JSONResponse(data_object.annotation_data)


@router.post("/annotations/{object_id}")
def store_annotations(
    object_id: str,
    session_id: str | None = None,
    annotation_data: str = Body(),
    db: Session = Depends(get_db),
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    if session_id is not None and data_object.locked_by != session_id:
        raise HTTPException(status_code=403, detail="Object is locked")

    data_object.annotated = False
    data_object.synced = False
    data_object.annotation_data = annotation_data
    db.commit()

    return Response()


@router.post("/annotations/pull/{object_id}")
def pull_annotations(object_id: str, db: Session = Depends(get_db)):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    project: Project = db.query(Project).filter_by(id=data_object.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    provider = get_annotations_provider(project)
    annotations = provider.pull(data_object, project)
    return JSONResponse(annotations)


@router.post("/annotations/push/{object_id}")
def push_annotations(
    object_id: str,
    annotation_data: str = Body(),
    db: Session = Depends(get_db),
):
    data_object: Object = db.query(Object).filter_by(id=object_id).first()
    if not data_object:
        raise HTTPException(status_code=404, detail="Object not found")

    project: Project = db.query(Project).filter_by(id=data_object.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    annotations = json.loads(annotation_data)
    provider = get_annotations_provider(project)
    provider.push(data_object, annotations, project)

    # mark as synced after successful push
    data_object.synced = True
    db.commit()

    return Response()
