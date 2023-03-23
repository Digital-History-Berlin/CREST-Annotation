from pydantic import BaseModel


class Iiif3Object(BaseModel):
    object_uuid: str
    image_uri: str
    thumbnail_uri: str | None
    object_data: str


class Iiif3Import(BaseModel):
    title: dict[str, list[str]] | None
    display: str | None
    objects: list[Iiif3Object]
    added: list[Iiif3Object]
    problems: list[str]
