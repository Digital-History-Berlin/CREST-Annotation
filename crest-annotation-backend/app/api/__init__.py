import json

from fastapi import APIRouter, HTTPException


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
from .import_objects_filesystem import router
from .import_objects_iiif3 import router
from .import_objects_iiif2 import router
from .import_objects_digital_heraldry import router
from .export_yaml import router

from .. import schemas

# extended object types
from .import_objects_iiif3.dependencies import Iiif3ObjectData
from .import_objects_iiif2.dependencies import Iiif2ObjectData
from .import_objects_filesystem.dependencies import FilesystemObjectData
from .import_objects_digital_heraldry.dependencies import DigitalHeraldryObjectData

# annotation providers
from .annotations_digital_heraldry.dependencies import (
    DigitalHeraldryAnnotationsProvider,
)

from ..models.objects import Object
from ..models.projects import Project


def get_object_data_schema(object_data):
    """
    Get image resolver from identifier
    """

    if object_data is None:
        raise ValueError()
    id = object_data.get("type")

    if id == "iiif3":
        return Iiif3ObjectData
    if id == "iiif2":
        return Iiif2ObjectData
    if id == "fs":
        return FilesystemObjectData
    if id == "dh":
        return DigitalHeraldryObjectData

    raise ModuleNotFoundError(name=id)


def get_object_image_uri(data_object: Object, usage: schemas.ImageRequest):
    """
    Get image URI from object
    """

    object_data = json.loads(data_object.object_data)
    schema = get_object_data_schema(object_data)
    data = schema(**object_data)

    return data.get_image_uri(usage)


def get_object_image_description(data_object: Object):
    """
    Get image description from object
    """

    object_data = json.loads(data_object.object_data)
    schema = get_object_data_schema(object_data)
    data = schema(**object_data)

    return data.get_image_description()


def get_annotations_provider(project: Project):
    """
    Get annotations provider by type identifier
    """

    if project.sync_type == "digital-heraldry":
        return DigitalHeraldryAnnotationsProvider()

    raise HTTPException(
        status_code=500,
        detail=f"Invalid annotations provider {project.sync_type}",
    )
