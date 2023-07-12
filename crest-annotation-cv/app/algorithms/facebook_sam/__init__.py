from fastapi import APIRouter

# declare the router for this algorithm
router = APIRouter(prefix="/facebook-sam")

# import all routes
from . import segment
