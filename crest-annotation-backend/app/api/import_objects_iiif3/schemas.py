from typing import Optional
from pydantic import BaseModel


class Iiif3Object(BaseModel):
    object_uuid: str
    image_uri: str
    thumbnail_uri: Optional[str]
    object_data: str


class Iiif3Import(BaseModel):
    title: Optional[dict[str, list[str]]]
    display: Optional[str]
    objects: list[Iiif3Object]
    added: list[Iiif3Object]
    problems: list[str]
