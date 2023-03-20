from typing import Optional, List
from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseProject(BaseModel):
    id: str
    name: str
    source: str
    color_table: List[str]


@create("id", "source", "color_table")
class CreateProject(BaseProject):
    pass


@patch("id")
class PatchProject(BaseProject):
    pass


@response()
class Project(BaseProject):
    pass
