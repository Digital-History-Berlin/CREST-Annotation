from sqlalchemy import Column, ForeignKey, String, Boolean, text

from ..database import Base, make_uuid


class Object(Base):
    __tablename__ = "objects"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    uri = Column(String)
    annotated = Column(Boolean, default=False)
    annotation_data = Column(String, default="[]")
