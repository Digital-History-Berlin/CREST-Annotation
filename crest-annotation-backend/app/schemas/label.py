
from pydantic import BaseModel


class Label(BaseModel):
    id: str
    name: str
