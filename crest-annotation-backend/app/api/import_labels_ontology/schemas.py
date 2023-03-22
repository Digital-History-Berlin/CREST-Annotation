from typing import Optional
from pydantic import BaseModel


class OntologyLabel(BaseModel):
    id: str
    name: str
    children: Optional[list["OntologyLabel"]]


class OntologyDescription(BaseModel):
    language: str
    value: str


class Ontology(BaseModel):
    creators: Optional[list[str]]
    titles: Optional[list[str]]
    licenses: Optional[list[str]]
    descriptions: Optional[list[OntologyDescription]]
    labels: list[OntologyLabel]
    problems: list[str]
