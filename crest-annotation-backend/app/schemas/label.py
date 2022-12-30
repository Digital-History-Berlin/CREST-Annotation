from typing import Optional, List
from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseLabel(BaseModel):
    id: str
    project_id: Optional[str]
    parent_id: Optional[str]
    reference: Optional[str]
    name: str
    starred: bool
    count: int
    color: str


@create("id", "starred", "count")
class CreateLabel(BaseLabel):
    pass


@patch("id")
class PatchLabel(BaseLabel):
    pass


@response("project_id")
class Label(BaseLabel):
    children: Optional[List["Label"]]
