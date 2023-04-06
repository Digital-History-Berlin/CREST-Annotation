from sqlalchemy import Column, ForeignKey, String, Integer, Boolean

from ..database import Base, make_uuid


class Label(Base):
    __tablename__ = "labels"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE", name="labels_project_id_fkey"))
    parent_id = Column(String, ForeignKey("labels.id"))
    reference = Column(String)
    name = Column(String)
    starred = Column(Boolean, default=False)
    count = Column(Integer, default=0)
    color = Column(String)
