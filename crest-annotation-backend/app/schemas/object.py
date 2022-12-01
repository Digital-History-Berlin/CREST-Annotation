
from pydantic import BaseModel


class Object(BaseModel):
    id: str
    annotationData: str
