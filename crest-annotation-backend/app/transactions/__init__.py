from fastapi import APIRouter


import_router = APIRouter(
    prefix="/import",
    tags=["import"],
    responses={404: {"description": "Not found"}},
)


export_router = APIRouter(
    prefix="/export",
    tags=["export"],
    responses={404: {"description": "Not found"}},
)


from .import_labels_ontology import router
from .import_objects_iiif3 import router
