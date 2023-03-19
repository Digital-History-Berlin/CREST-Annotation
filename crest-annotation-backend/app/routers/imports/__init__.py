from fastapi import APIRouter


router = APIRouter(
    prefix="/import",
    tags=["import"],
    responses={404: {"description": "Not found"}},
)


from .ontology import *
from .iiif import *
