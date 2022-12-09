from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from ..dependencies.db import get_db
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
        "source": project.source,
    }


@router.get("/", response_model=List[schemas.Project])
async def get_projects(db: Session = Depends(get_db)):
    projects: List[Project] = db.query(Project)

    return JSONResponse(list(map(map_project, projects)))


@router.get("/by-id/{project_id}", response_model=schemas.Project)
async def get_project(project_id: str, db: Session = Depends(get_db)):
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return JSONResponse(map_project(project))


@router.patch("/", response_model=schemas.Project)
async def update_project(
    shallow: schemas.ShallowProject,
    db: Session = Depends(get_db),
):
    projects = db.query(Project).filter_by(id=shallow.id)
    projects.update(shallow.dict(exclude_none=True))

    project = projects.first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.commit()
    db.refresh(project)

    return JSONResponse(map_project(project))


@router.post("/", response_model=schemas.Project)
async def create_project(
    shallow: schemas.ShallowProject,
    db: Session = Depends(get_db),
):
    project = Project(**shallow.dict())

    db.add(project)
    db.commit()
    db.refresh(project)

    return JSONResponse(map_project(project))


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
):
    modified = db.query(Project).filter_by(id=project_id).delete()
    if modified != 1:
        raise HTTPException(status_code=404, detail="Project not found")

    db.commit()

    return Response()
