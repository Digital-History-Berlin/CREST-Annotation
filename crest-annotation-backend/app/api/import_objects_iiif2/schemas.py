from pydantic import BaseModel, Field


class Base(BaseModel):
    class Config:
        allow_population_by_field_name = True


class Service(Base):
    id: str = Field(alias="@id")
    context: str = Field(alias="@context")
    profile: str | None


class Resource(Base):
    id: str = Field(alias="@id")
    format: str
    service: Service


class Image(Base):
    id: str | None = Field(alias="@id")
    type: str = Field(alias="@type")
    motivation: str = Field(default="sc:painting", const=True)
    resource: Resource


class Canvas(Base):
    id: str = Field(alias="@id")
    images: list[Image]


class Sequence(Base):
    id: str = Field(alias="@id")
    canvases: list[Canvas]


# partial implementation of the IIIF 2.1 presentation API
# TODO: check compatibility with IIIF 2.0
# TODO: add fields as required
class Manifest(Base):
    id: str = Field(alias="@id")
    label: str
    sequences: list[Sequence]
