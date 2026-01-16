from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseObject(BaseModel):
    id: str
    object_uuid: str | None
    annotated: bool | None
    synced: bool | None
    annotation_data: str


@create("id", "object_uuid", "annotated", "annotation_data", "annotated")
class CreateObject(BaseObject):
    pass


@response()
class Object(BaseObject):
    pass


@response("annotation_data")
class SummaryObject(BaseObject):
    pass


class ImageRequest(BaseModel):
    thumbnail: bool | None
    width: int | None
    height: int | None


class ObjectFilters(BaseModel):
    annotated: bool | None
    synced: bool | None
    search: str | None
