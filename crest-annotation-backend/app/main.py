from fastapi import FastAPI
from sqlalchemy.orm import Session

from .routers import data
from .database import Base, engine

# initialize SQLalchemy
# TODO: use Alembic
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(data.router)
