import yaml
import json

from fastapi import Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.models.objects import Object

from .. import export_router as router


@router.get("/yaml")
async def get_yaml_export(project_id: str, db: Session = Depends(get_db)):
    objects: list[Object] = db.query(Object).filter_by(project_id=project_id)

    return PlainTextResponse(
        yaml.dump(
            {
                "images": [
                    {
                        "uuid": data_object.object_uuid,
                        "annotations": json.loads(data_object.annotation_data),
                        "source": json.loads(data_object.object_data),
                    }
                    for data_object in objects
                ]
            }
        )
    )
