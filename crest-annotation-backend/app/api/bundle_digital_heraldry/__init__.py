import json

from pydantic import BaseModel, Field

from app import schemas
from app.models.projects import Project


class SparqlBinding(BaseModel):
    datatype: str | None = None
    type: str
    value: str


class SparqlBindings(dict[str, SparqlBinding]):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, cls):
            return v

        # parse each value as SparqlBinding
        return cls({key: SparqlBinding(**value) for key, value in v.items()})

    def require(self, key: str):
        binding = self.get(key)
        if binding is None:
            raise Exception(f"Missing binding {key}")

        return binding.value

    def optional(self, key: str, fallback: str | None = None):
        binding = self.get(key)

        # unwrap the binding while providing fallback
        return binding.value if binding else fallback


class SparqlResults(BaseModel):
    bindings: list[SparqlBindings]


class SparqlQueryResponse(BaseModel):
    results: SparqlResults


class DigitalHeraldryObjectData(BaseModel):
    """
    Specific data for objects imported from Digital Heraldry
    """

    type = Field(default="dh", const=True)

    folio: str
    image: str | None
    bindings: dict[str, str]

    def get_image_uri(self, usage: schemas.ImageRequest):
        return self.image

    def get_image_description(self):
        return self.folio


def substitute_variables(query: str, variables: dict[str, str]) -> str:
    """
    Replace {{variable}} placeholders in query with actual values
    """

    result = query
    for key, value in variables.items():
        result = result.replace(f"{{{{{key}}}}}", value)
    return result


def get_project_custom_fields(project: Project) -> dict[str, str]:
    """
    Extract custom fields from project
    """

    if not project.custom_fields:
        return {}
    try:
        return json.loads(project.custom_fields)
    except json.JSONDecodeError:
        return {}
