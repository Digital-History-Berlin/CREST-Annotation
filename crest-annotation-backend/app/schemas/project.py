from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseProject(BaseModel):
    id: str
    name: str
    source: str | None
    color_table: list[str]


@create("id", "source", "color_table")
class CreateProject(BaseProject):
    pass


@patch("id")
class PatchProject(BaseProject):
    pass


@response()
class Project(BaseProject):
    pass
