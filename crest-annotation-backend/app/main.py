from fastapi import FastAPI
from fastapi_utils import openapi
from sqlalchemy.orm import Session

from .routers import labels, objects, projects
from .database import Base, engine

# initialize SQLalchemy
# TODO: use Alembic
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(labels.router)
app.include_router(objects.router)
app.include_router(projects.router)

# use function names only for endpoint names,
# which improves readability on the frontend side
openapi.simplify_operation_ids(app)
