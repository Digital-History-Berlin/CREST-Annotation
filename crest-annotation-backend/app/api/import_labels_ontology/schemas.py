from pydantic import BaseModel


class OntologyLabel(BaseModel):
    id: str
    name: str
    children: list["OntologyLabel"] | None


class OntologyDescription(BaseModel):
    language: str
    value: str


class Ontology(BaseModel):
    creators: list[str] | None
    titles: list[str] | None
    licenses: list[str] | None
    descriptions: list[OntologyDescription] | None
    labels: list[OntologyLabel]
    problems: list[str]
