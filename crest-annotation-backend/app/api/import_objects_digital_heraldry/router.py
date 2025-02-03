import requests

from pydantic import ValidationError
from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from rdflib import Graph

from app.dependencies.db import get_db
from app.dependencies.logger import get_logger
from app.models.projects import Project
from app.models.objects import Object

from .. import import_router as router

from .dependencies import DigitalHeraldry, DigitalHeraldryObject, DigitalHeraldryImport
from .queries import select_image_urls_from_iiif_manifest


def map_object(project_id: str, object: DigitalHeraldryObject) -> Object:
    return Object(
        project_id=project_id,
        object_uuid=object.object_uuid,
        object_data=object.object_data.json(),
    )


@router.post("/digital-heraldry", response_model=DigitalHeraldryImport)
async def import_digital_heraldry(
    url: str,
    project_id: str,
    commit: bool = False,
    digital_heraldry: DigitalHeraldry = Depends(DigitalHeraldry),
    db: Session = Depends(get_db),
    logger=Depends(get_logger),
):
    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    logger.info(f"Pulling RDF turtle representation from {url}")

    problems = []
    graph = Graph()
    graph.parse(url)

    logger.info(f"Querying objects")

    result = graph.query(
        select_image_urls_from_iiif_manifest.QUERY,
        initBindings={
            "manifestIRI": "https://gallica.bnf.fr/iiif/ark:/12148/btv1b55009806h/manifest.json"
        },
    )

    print(result.serialize())

    for row in result:
        print(row)

    """
    # compare against known objects
    query = db.query(Object.object_uuid).filter_by(project_id=project_id)
    known = set(obj.object_uuid for obj in query)
    added = list(obj for obj in objects if obj.object_uuid not in known)

    # insert new objects
    if commit:
        db.add_all(map_object(project_id, obj) for obj in objects)
        db.commit()
    """

    return JSONResponse(
        DigitalHeraldryImport(
            objects=[],
            added=[],
            problems=problems,
        ).dict()
    )
