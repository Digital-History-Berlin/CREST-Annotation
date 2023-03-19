from typing import Optional
from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseObject(BaseModel):
    id: str
    uri: str
    thumbnail_uri: Optional[str]
    annotated: bool
    annotation_data: str


@response()
class Object(BaseObject):
    pass
