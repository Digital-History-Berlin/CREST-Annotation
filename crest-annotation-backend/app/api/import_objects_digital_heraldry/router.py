from pydantic import ValidationError
from fastapi import Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from SPARQLWrapper import SPARQLWrapper, JSON
from rdflib import Graph

from app.dependencies.db import get_db
from app.dependencies.logger import get_logger
from app.models.projects import Project
from app.models.objects import Object

from .. import import_router as router

from ..bundle_digital_heraldry import SparqlQueryResponse
from .dependencies import (
    DigitalHeraldry,
    DigitalHeraldryObject,
    DigitalHeraldryImport,
)


@router.post("/digital-heraldry", response_model=DigitalHeraldryImport)
def import_digital_heraldry(
    endpoint: str,
    project_id: str,
    commit: bool = False,
    query: str = Body(embed=True),
    digital_heraldry: DigitalHeraldry = Depends(DigitalHeraldry),
    db: Session = Depends(get_db),
    logger=Depends(get_logger),
):
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    logger.info(f"Executing SPARQL query on {endpoint}")
    sparql = SPARQLWrapper(endpoint=endpoint, returnFormat=JSON)
    sparql.setQuery(query)

    problems = []

    # TODO: error handling
    result = sparql.queryAndConvert()
    response = SparqlQueryResponse(**result)
    objects = digital_heraldry.extract_objects(response)

    # compare against known objects
    query = db.query(Object.object_uuid).filter_by(project_id=project_id)
    known = set(obj.object_uuid for obj in query)
    added = list(obj for obj in objects if obj.object_uuid not in known)
    count = len(known)

    # insert new objects
    if commit:
        db.add_all(
            Object(
                project_id=project_id,
                object_uuid=obj.object_uuid,
                position=count + i,
                object_data=obj.object_data.json(),
            )
            for i, obj in enumerate(objects)
        )
        db.commit()

    return JSONResponse(
        DigitalHeraldryImport(
            objects=[],
            added=added,
            problems=[],
        ).dict()
    )
