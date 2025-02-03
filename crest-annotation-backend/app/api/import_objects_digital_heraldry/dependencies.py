import json

from pydantic import BaseModel, Field
from fastapi import Depends, HTTPException

from app.dependencies.logger import get_logger
from app import schemas


class DigitalHeraldryObjectData(BaseModel):
    """
    Specific data for objects imported from Digital Heraldry
    """

    type = Field(default="dh", const=True)

    manifest: str
    sequence: str
    canvas: str
    image: str | None


class DigitalHeraldryObject(schemas.CreateObject):
    object_data: DigitalHeraldryObjectData


class DigitalHeraldryImport(BaseModel):
    objects: list[DigitalHeraldryObject]
    added: list[DigitalHeraldryObject]
    problems: list[str]


class DigitalHeraldry:
    """
    Helper class to navigate Digital Heraldry ontologies
    """

    def __init__(self, logger=Depends(get_logger)):
        self._logger = logger
