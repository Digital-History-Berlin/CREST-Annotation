from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
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


@router.get("/of/{project_id}", response_model=List[schemas.Label])
async def get_project_labels(project_id: str, db: Session = Depends(get_db)):
    projects: List[Label] = db.query(Label).filter_by(project_id=project_id)

    return JSONResponse(
        list(
            map(
                lambda label: {
                    "id": label.id,
                    "name": label.name,
                },
                projects,
            )
        )
    )
