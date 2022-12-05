import logging

from fastapi import FastAPI
from fastapi_utils import openapi
from fastapi.middleware.cors import CORSMiddleware

from .routers import labels, objects, projects
from .database import Base, engine
from .environment import env

# initialize SQLalchemy
# TODO: use Alembic
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = env.cors_origins.split(",")

logging.info(f"CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(labels.router)
app.include_router(objects.router)
app.include_router(projects.router)

# use function names only for endpoint names,
# which improves readability on the frontend side
openapi.simplify_operation_ids(app)
