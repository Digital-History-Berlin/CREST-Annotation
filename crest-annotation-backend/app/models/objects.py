from sqlalchemy import Column, ForeignKey, String, Integer, Boolean, Index

from ..database import Base, make_uuid


class Object(Base):
    __tablename__ = "objects"

    id = Column(String, primary_key=True, index=True, default=make_uuid)
    project_id = Column(
        String,
        ForeignKey("projects.id", ondelete="CASCADE", name="objects_project_id_fkey"),
    )
    object_uuid = Column(String)
    position = Column(Integer)
    annotated = Column(Boolean, default=False)
    synced = Column(Boolean, default=True)
    annotation_data = Column(String, default="[]")
    object_data = Column(String)
    locked_by = Column(String, default=None)


Index("objects_project_id_uri", Object.project_id, Object.object_uuid)
