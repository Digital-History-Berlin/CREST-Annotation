from typing import Callable

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from ..dependencies.colors import Colors, ColorTable
from ..dependencies.db import get_db, get_paginate
from ..models.projects import Project
from .. import schemas

router = APIRouter(
    prefix="/projects",
    tags=["project"],
    responses={404: {"description": "Not found"}},
)


class Mapper:
    def __init__(self, colors=Depends(Colors)):
        self._colors = colors

    def to_schema(self, project: Project) -> schemas.Project:
        return schemas.Project(
            id=project.id,
            name=project.name,
            source=project.source,
            # parse color table from JSON or use default
            color_table=self._colors.parse(project.color_table).colors,
        )

    def to_dict(self, project: Project):
        return self.to_schema(project).dict()

    def map_dict(self, project_dict) -> Project:
        color_table = project_dict["color_table"]
        if color_table is not None:
            project_dict["color_table"] = ColorTable(color_table).jsonify()
        return project_dict


@router.get("/", response_model=schemas.Paginated[schemas.Project])
async def get_projects(
    mapper: Mapper = Depends(Mapper),
    paginate: Callable = Depends(get_paginate),
    db: Session = Depends(get_db),
):
    projects: schemas.Paginated[schemas.Project] = paginate(
        db.query(Project), mapper.to_schema
    )

    return JSONResponse(projects.dict())


@router.get("/by-id/{project_id}", response_model=schemas.Project)
async def get_project(
    project_id: str,
    mapper: Mapper = Depends(Mapper),
    db: Session = Depends(get_db),
):
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return JSONResponse(mapper.to_dict(project))


@router.patch("/", response_model=schemas.Project)
async def update_project(
    patch: schemas.PatchProject,
    mapper: Mapper = Depends(Mapper),
    db: Session = Depends(get_db),
):
    projects = db.query(Project).filter_by(id=patch.id)
    projects.update(mapper.map_dict(patch.dict(exclude_none=True)))

    project = projects.first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.commit()
    db.refresh(project)

    return JSONResponse(mapper.to_dict(project))


@router.post("/", response_model=schemas.Project)
async def create_project(
    create: schemas.CreateProject,
    mapper: Mapper = Depends(Mapper),
    db: Session = Depends(get_db),
):
    project = Project(**mapper.map_dict(create.dict()))

    db.add(project)
    db.commit()
    db.refresh(project)

    return JSONResponse(mapper.to_dict(project))


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
