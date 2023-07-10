from sqlalchemy import Column, ForeignKey, String, Boolean, Index

from ..database import Base, make_uuid


class Object(Base):
    __tablename__ = "objects"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE", name="objects_project_id_fkey"))
    object_uuid = Column(String)
    annotated = Column(Boolean, default=False)
    annotation_data = Column(String, default="[]")
    object_data = Column(String)


Index("objects_project_id_uri", Object.project_id, Object.object_uuid)
