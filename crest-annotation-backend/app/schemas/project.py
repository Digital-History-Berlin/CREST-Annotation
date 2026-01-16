from pydantic import BaseModel


from .modifiers import create, patch, response


class BaseProject(BaseModel):
    id: str
    name: str
    source: str | None
    color_table: list[str]
    sync_type: str | None
    sync_config: str | None
    custom_fields: dict[str, str] | None


@create("id", "source", "color_table", "sync_type", "sync_config", "custom_fields")
class CreateProject(BaseProject):
    pass


@patch("id")
class PatchProject(BaseProject):
    pass


@response()
class Project(BaseProject):
    pass
