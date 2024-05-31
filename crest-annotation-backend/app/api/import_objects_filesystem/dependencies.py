import os
import uuid

from pydantic import BaseModel, Field
from fastapi import Depends

from ...dependencies.logger import get_logger
from app import schemas


class FilesystemObjectData(BaseModel):
    """
    Specific data for objects imported from file system
    """

    type = Field(default="fs", const=True)

    path: str

    def get_image_uri(self, usage: schemas.ImageRequest):
        return self.path


class FilesystemObject(schemas.CreateObject):
    object_data: FilesystemObjectData


class FilesystemImport(BaseModel):
    objects: list[FilesystemObject]
    added: list[FilesystemObject]


class Filesystem:
    """
    Helper class to import from file system
    """

    def __init__(self, logger=Depends(get_logger)):
        self._logger = logger

    def is_image(self, image: str):
        """
        Check if file is an image
        """

        # TODO: extend as needed
        return image.lower().endswith(
            (
                ".png",
                ".jpg",
                ".jpeg",
                ".tiff",
                ".bmp",
                ".gif",
            )
        )

    def extract_objects(self, path: str):
        """
        Extract objects in path
        """

        return list(
            FilesystemObject(
                object_uuid=uuid.uuid4().hex,
                object_data=FilesystemObjectData(
                    path=f"file:///{os.path.join(path, image)}",
                ),
            )
            # extract sequences from manifest
            for image in os.listdir(path)
            if self.is_image(image)
        )
