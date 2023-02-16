from typing import Optional
from pydantic import BaseModel


# TODO: schemas are outdated, see label.py
class BaseObject(BaseModel):
    annotation_data: str


class ShallowObject(BaseObject):
    id: Optional[str]


class Object(BaseObject):
    id: str
