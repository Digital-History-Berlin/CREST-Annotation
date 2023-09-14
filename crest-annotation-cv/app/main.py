import logging

logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("requests_cache").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .environment import env
from .routers import common

# TODO: automatically import routers
from .algorithms import example_segment
from .algorithms import facebook_sam


app = FastAPI()

origins = env.cors_origins.split(",")

logging.info("CORS origins: %s", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(common.router)
# TODO: automatically include routers
app.include_router(example_segment.router)
app.include_router(facebook_sam.router)
