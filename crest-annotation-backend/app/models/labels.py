from sqlalchemy import Column, ForeignKey, String, text

from ..database import Base, make_uuid


class Label(Base):
    __tablename__ = "labels"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    name = Column(String)
    color = Column(String)
