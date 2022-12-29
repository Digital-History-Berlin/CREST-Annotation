from typing import Optional
from pydantic import BaseModel


class BaseProject(BaseModel):
    name: str
    color_table: Optional[str]


class ShallowProject(BaseProject):
    id: Optional[str]
    source: Optional[str]


class Project(BaseProject):
    id: str
    source: Optional[str]
