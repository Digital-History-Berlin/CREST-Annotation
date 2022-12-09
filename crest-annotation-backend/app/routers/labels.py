from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from ..dependencies.db import get_db
from ..dependencies.logger import get_logger
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
        "name": label.name,
    }


@router.get("/of/{project_id}", response_model=List[schemas.Label])
async def get_project_labels(project_id: str, db: Session = Depends(get_db)):
    projects: List[Label] = db.query(Label).filter_by(project_id=project_id)

    return JSONResponse(list(map(map_label, projects)))


@router.patch("/", response_model=schemas.Label)
async def update_label(
    shallow: schemas.ShallowLabel,
    db: Session = Depends(get_db),
):
    labels = db.query(Label).filter_by(id=shallow.id)
    labels.update(shallow.dict(exclude_none=True))

    label = labels.first()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")

    db.commit()
    db.refresh(label)

    return JSONResponse(map_label(label))


@router.post("/", response_model=schemas.Label)
async def create_label(
    shallow: schemas.ShallowLabel,
    db: Session = Depends(get_db),
):
    label = Label(**shallow.dict())

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
