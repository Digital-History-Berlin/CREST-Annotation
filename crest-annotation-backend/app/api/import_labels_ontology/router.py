from uuid import uuid4

from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from pyld import jsonld

from app.dependencies.db import get_db
from app.dependencies.logger import get_logger
from app.dependencies.colors import Colors
from app.models.labels import Label
from app.models.projects import Project

from .. import import_router as router

from .dependencies import Ontology
from . import schemas


@router.get("/ontology", response_model=schemas.Ontology)
def get_ontology_import(
    url: str, ontology: Ontology = Depends(Ontology), logger=Depends(get_logger)
):
    jsonld.set_document_loader(jsonld.requests_document_loader(timeout=30))

    logger.info(f"Pulling ontology from {url}")
    document = jsonld.expand(url)

    # filter relevant items
    items = ontology.by_types(document, ontology.class_ids)
    items = ontology.with_tags(items, ["@id"])

    # validate items
    # TODO: improve codebase
    problems = []
    for item in items:
        if not ontology.get_label(item):
            problems.append(f"Missing name for {item['@id']}")

    labels = ontology.as_tree(
        items,
        inflate=lambda item: {
            "name": ontology.get_label(item),
        },
    )

    # parse metadata
    meta = ontology.get_meta_data(document)

    return JSONResponse(
        {
            **meta.json(),
            "labels": labels,
            "problems": problems,
        }
    )


@router.post("/ontology")
def import_ontology(
    url: str,
    project_id: str,
    classes: list[str],
    method: str = "None",
    ontology: Ontology = Depends(Ontology),
    colors: Colors = Depends(Colors),
    db: Session = Depends(get_db),
    logger=Depends(get_logger),
):
    # helper function for recursively adding tree to database
    def _add_branch(labels, parent_id=None):
        for label in labels:
            if label["id"] not in classes:
                continue
            if not label["name"]:
                continue

            label_id = uuid4()
            db.add(
                Label(
                    id=label_id,
                    parent_id=parent_id,
                    project_id=project_id,
                    reference=label["id"],
                    name=label["name"],
                    # TODO: use index as color, so labels adapt when color table changes
                    color=color_table.get(),
                )
            )

            _add_branch(label["children"], label_id)

    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # delete existing labels
    if method == "override":
        db.query(Label).filter_by(project_id=project_id).delete()

    # ensure project does not yet contain any labels
    labels: list[Label] = db.query(Label).filter_by(project_id=project_id)
    if labels.count():
        return JSONResponse({"result": "conflict"})

    # get project color table
    color_table = colors.parse(project.color_table)

    # load document
    jsonld.set_document_loader(jsonld.requests_document_loader(timeout=30))

    logger.info(f"Importing {len(classes)} labels from {url}")
    document = jsonld.expand(url)

    # add selected labels
    items = ontology.by_types(document, ontology.class_ids)
    items = ontology.with_tags(items, ["@id"])
    labels = ontology.as_tree(
        items,
        inflate=lambda item: {
            "name": ontology.get_label(item),
        },
    )

    # Recursively add the labels to the database.
    # This will automatically create duplicates if an items is present in multiple branches.
    # These items will have different UUIDs but share the same reference from their @id tag.
    _add_branch(labels)

    db.commit()

    return JSONResponse({"result": "success"})
