from sqlalchemy import Column, ForeignKey, String, Integer, text

from ..database import Base, make_uuid


class Label(Base):
    __tablename__ = "labels"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    parent_id = Column(String, ForeignKey("labels.id"))
    reference = Column(String)
    name = Column(String)
    flags = Column(Integer)
    count = Column(Integer)
    color = Column(String)
