from typing import List, Union
from enum import auto

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi_utils.enums import StrEnum
from sqlalchemy.orm import Session

from ..dependencies.db import get_db
from ..models.labels import Label
from .. import schemas

router = APIRouter(
    prefix="/labels",
    tags=["label"],
    responses={404: {"description": "Not found"}},
)


def map_label(label: Label) -> schemas.Label:
    return {
        "id": label.id,
        "parent_id": label.parent_id,
        "reference": label.reference,
        "name": label.name,
        "starred": label.starred,
        "count": label.count,
        "color": label.color,
    }


class Sorting(StrEnum):
    name = auto()
    count = auto()


def order_by(sorting):
    if not sorting:
        return []

    mapping = {
        Sorting.name: Label.name,
        Sorting.count: Label.count,
    }

    return [mapping[sorting]]


@router.get("/of/{project_id}", response_model=List[schemas.Label])
async def get_project_labels(
    project_id: str,
    sorting: Sorting = Sorting.name,
    direction: schemas.SortDirection = schemas.SortDirection.asc,
    starred: Union[bool, None] = None,
    grouped: bool = False,
    db: Session = Depends(get_db),
):

    labels: List[Label] = (
        db.query(Label)
        .filter_by(project_id=project_id)
        .order_by(*map(direction.apply, order_by(sorting)))
    )

    if starred is not None:
        labels = labels.filter_by(starred=starred)

    if not grouped:
        return JSONResponse(list(map(map_label, labels)))

    # generate tree structure
    roots: List[schemas.Label] = []
    indexed = {label.id: {**map_label(label), "children": []} for label in labels}
    for label in indexed.values():
        parent_id = label.get("parent_id")
        if parent_id:
            parent = indexed.get(parent_id)
            if parent:
                parent["children"].append(label)
        else:
            roots.append(label)

    return JSONResponse(roots)


@router.patch("/", response_model=schemas.Label)
async def update_label(
    patch: schemas.PatchLabel,
    db: Session = Depends(get_db),
):
    labels = db.query(Label).filter_by(id=patch.id)
    labels.update(patch.dict(exclude_none=True))

    label = labels.first()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")

    db.commit()
    db.refresh(label)

    return JSONResponse(map_label(label))


@router.post("/", response_model=schemas.Label)
async def create_label(
    create: schemas.CreateLabel,
    db: Session = Depends(get_db),
):
    label = Label(**create.dict())

    db.add(label)
    db.commit()
    db.refresh(label)

    return JSONResponse(map_label(label))


@router.delete("/{label_id}")
async def delete_label(
    label_id: str,
    db: Session = Depends(get_db),
):
    modified = db.query(Label).filter_by(id=label_id).delete()
    if modified != 1:
        raise HTTPException(status_code=404, detail="Label not found")

    db.commit()

    return Response()
