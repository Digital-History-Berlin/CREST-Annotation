import json

from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from pyld import jsonld

from ..dependencies.db import get_db
from ..dependencies.logger import get_logger
from ..dependencies.ontology import Ontology
from ..dependencies.colors import Colors
from ..models.labels import Label
from ..models.projects import Project
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
        "color": label.color,
    }


@router.get("/of/{project_id}", response_model=List[schemas.Label])
async def get_project_labels(project_id: str, db: Session = Depends(get_db)):
    labels: List[Label] = db.query(Label).filter_by(project_id=project_id)

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


@router.get("/import/ontology", response_model=schemas.Ontology)
async def get_ontology_import(
    url: str, ontology: Ontology = Depends(Ontology), logger=Depends(get_logger)
):
    jsonld.set_document_loader(jsonld.requests_document_loader(timeout=30))

    logger.info(f"pulling ontology from {url}")
    document = jsonld.expand(url)

    # filter relevant items
    items = ontology.by_type(document, ontology.class_id)
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


@router.post("/import/ontology")
async def import_ontology(
    url: str,
    project_id: str,
    method: Optional[str],
    classes: List[str],
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

            id = uuid4()
            db.add(
                Label(
                    id=id,
                    parent_id=parent_id,
                    project_id=project_id,
                    reference=label["id"],
                    name=label["name"],
                    # TODO: use index as color, so labels adapt when color table changes
                    color=color_table.get(),
                )
            )

            _add_branch(label["children"], id)

    project: Project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # delete existing labels
    if method == "override":
        db.query(Label).filter_by(project_id=project_id).delete()

    # ensure project does not yet contain any labels
    labels: List[Label] = db.query(Label).filter_by(project_id=project_id)
    if labels.count():
        return JSONResponse({"result": "conflict"})

    # get project color table
    color_table = colors.parse(project.color_table)

    # load document
    jsonld.set_document_loader(jsonld.requests_document_loader(timeout=30))

    logger.info(f"Importing {len(classes)} labels from {url}")
    document = jsonld.expand(url)

    # add selected labels
    items = ontology.by_type(document, ontology.class_id)
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
