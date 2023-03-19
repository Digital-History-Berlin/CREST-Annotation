from typing import List, Dict, Optional
from pydantic import BaseModel


class Iiif3Data(BaseModel):
    canvas: str
    page: str
    annotation: str


class Iiif3Image(BaseModel):
    uri: str
    thumbnail_uri: Optional[str]
    object_data: Iiif3Data


class Iiif3Import(BaseModel):
    title: Optional[Dict[str, str]]
    display: Optional[str]
    images: List[Iiif3Image]
    added: List[Iiif3Image]
    problems: List[str]
