from typing import Optional, List
from pydantic import BaseModel


# TODO: schemas are outdated, see label.py
class BaseProject(BaseModel):
    name: str


class ShallowProject(BaseProject):
    id: Optional[str]
    source: Optional[str]
    color_table: Optional[List[str]]


class Project(BaseProject):
    id: str
    source: Optional[str]
    color_table: List[str]
