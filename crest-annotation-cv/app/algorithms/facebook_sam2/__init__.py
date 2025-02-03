from fastapi import APIRouter

# declare the router for this algorithm
router = APIRouter(prefix="/facebook-sam2")

# import all routes
from . import routes
