from fastapi import APIRouter

# declare the router for this algorithm
router = APIRouter(prefix="/example-segment")

# import all routes
from . import segment
