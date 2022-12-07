from typing import Optional
from pydantic import BaseModel


class BaseLabel(BaseModel):
    name: str


class ShallowLabel(BaseLabel):
    id: Optional[str]
    project_id: Optional[str]


class Label(BaseLabel):
    id: str
