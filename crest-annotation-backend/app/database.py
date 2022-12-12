from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .environment import env


def make_uuid():
    return str(uuid4())


engine = create_engine(
    env.database_url, connect_args={"password": env.database_password}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
