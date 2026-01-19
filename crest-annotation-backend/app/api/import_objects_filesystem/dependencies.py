import os
import uuid
import base64

from pydantic import BaseModel, Field
from fastapi import Depends

from app.environment import env
from app.dependencies.logger import get_logger
from app import schemas


class FilesystemObjectData(BaseModel):
    """
    Specific data for objects imported from file system
    """

    type = Field(default="fs", const=True)

    path: str

    def get_image_uri(self, usage: schemas.ImageRequest):
        return f"{env.image_local_url}/{self.path}"

    def get_image_description(self):
        return self.path


class FilesystemObject(BaseModel):
    object_uuid: str
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

    def encode_path(self, path: str, image: str):
        """
        Return URL-safe encoded path
        """

        # use base32 encoding to avoid special characters
        raw = os.path.join(path, image).encode()
        return base64.b32encode(raw).decode()

    def extract_objects(self, path: str):
        """
        Extract objects in path
        """

        return list(
            FilesystemObject(
                object_uuid=uuid.uuid4().hex,
                object_data=FilesystemObjectData(
                    path=self.encode_path(path, image),
                ),
            )
            # extract sequences from manifest
            for image in os.listdir(path)
            if self.is_image(image)
        )
