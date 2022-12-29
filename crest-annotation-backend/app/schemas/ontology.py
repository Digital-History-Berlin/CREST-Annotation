from typing import List, Optional
from pydantic import BaseModel


class OntologyLabel(BaseModel):
    id: str
    name: str
    children: Optional[List["OntologyLabel"]]


class OntologyDescription(BaseModel):
    language: str
    value: str


class Ontology(BaseModel):
    creators: Optional[List[str]]
    titles: Optional[List[str]]
    licenses: Optional[List[str]]
    descriptions: Optional[List[OntologyDescription]]
    labels: List[OntologyLabel]
