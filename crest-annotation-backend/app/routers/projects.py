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


def map_project(project: Project) -> schemas.Project:
    return {
        "id": project.id,
        "name": project.name,
    }


@router.get("/", response_model=List[schemas.Project])
async def get_projects(db=Depends(get_db)):
    projects: List[Project] = db.query(Project)

    return JSONResponse(
        list(
            map(
                map_project,
                projects,
            )
        )
    )


@router.post("/", response_model=schemas.Project)
async def create_project(
    shallow: schemas.ShallowProject, db=Depends(get_db), logger=Depends(get_logger)
):
    project = Project(**shallow.dict())

    db.add(project)
    db.commit()
    db.refresh(project)

    return JSONResponse(map_project(project))
