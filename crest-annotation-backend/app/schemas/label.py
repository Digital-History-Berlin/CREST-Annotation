from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseLabel(BaseModel):
    id: str
    project_id: str | None
    parent_id: str | None
    reference: str | None
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
    children: list["Label"] | None
