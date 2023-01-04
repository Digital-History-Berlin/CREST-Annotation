from sqlalchemy import Column, String, text

from ..database import Base, make_uuid


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    name = Column(String)
    source = Column(String)
    color_table = Column(String)
