import json

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
from .import_objects_iiif2 import router
from .export_yaml import router

from .. import schemas

# extended object types
from .import_objects_iiif3.dependencies import Iiif3ObjectData
from .import_objects_iiif2.dependencies import Iiif2ObjectData


from ..models.objects import Object


def get_object_data_schema(object_data):
    """
    Get image resolver from identifier
    """

    if object_data is None:
        raise ValueError()

    if object_data.get("type") == "iiif3":
        return Iiif3ObjectData
    if object_data.get("type") == "iiif2":
        return Iiif2ObjectData

    raise ModuleNotFoundError(name=id)


def get_object_image_uri(data_object: Object, usage: schemas.ImageRequest):
    """
    Get image URI from object
    """

    object_data = json.loads(data_object.object_data)
    schema = get_object_data_schema(object_data)
    data = schema(**object_data)

    return data.get_image_uri(usage)
