from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from ..dependencies.db import get_db
from ..dependencies.logger import get_logger
from ..models.projects import Project
from .. import schemas

router = APIRouter(
    prefix="/projects",
    tags=["project"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Project])
async def get_projects(db=Depends(get_db)):
    projects: List[Project] = db.query(Project)

    return JSONResponse(
        list(
            map(
                lambda project: {
                    "id": project.id,
                    "name": project.name,
                },
                projects,
            )
        )
    )


@router.post("/")
async def create_project(project: schemas.ShallowProject, db=Depends(get_db)):
    db_project = db.add(Project(**project))
    db.commit()
