from typing import Optional
from pydantic import BaseModel


class BaseObject(BaseModel):
    annotationData: str


class ShallowObject(BaseObject):
    id: Optional[str]


class Object(BaseObject):
    id: str
