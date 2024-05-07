from fastapi import APIRouter

# declare the router for this algorithm
router = APIRouter(prefix="/custom-crest-detection")

# import all routes
from . import routes
