from typing import Optional, List
from pydantic import BaseModel


class BaseLabel(BaseModel):
    reference: Optional[str]
    parent_id: Optional[str]
    name: str
    color: str


class ShallowLabel(BaseLabel):
    id: Optional[str]
    project_id: Optional[str]


class Label(BaseLabel):
    id: str
    children: Optional[List["Label"]]
