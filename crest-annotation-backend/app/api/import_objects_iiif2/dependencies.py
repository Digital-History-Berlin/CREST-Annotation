import json

from pydantic import BaseModel, Field
from fastapi import Depends, HTTPException

from app.dependencies.logger import get_logger
from app import schemas

from ..service_image_iiif import iiif3, iiif2, iiif1

from .schemas import Manifest, Image, Service


class Iiif2ObjectData(BaseModel):
    """
    Specific data for objects imported from IIIF 2.x
    """

    type = Field(default="iiif2", const=True)

    manifest: str
    sequence: str
    canvas: str
    image: str | None

    service: Service

    def get_image_uri(self, usage: schemas.ImageRequest):
        # IIIF 3.0 Image API
        if self.service.context == "http://iiif.io/api/image/3/context.json":
            return iiif3.get_image_uri(self.service.id, usage)
        # IIIF 2.x Image API
        if self.service.context == "http://iiif.io/api/image/2/context.json":
            return iiif2.get_image_uri(self.service.id, usage)
        # IIIF 1.x Image API
        if self.service.context == "http://iiif.io/api/image/1/context.json":
            return iiif1.get_image_uri(self.service.id, usage)

        raise HTTPException(status_code=404, detail="No compatible image service")


class Iiif2Object(schemas.CreateObject):
    object_data: Iiif2ObjectData


class Iiif2Import(BaseModel):
    title: str | None
    objects: list[Iiif2Object]
    added: list[Iiif2Object]
    problems: list[str]


class Iiif2:
    """
    Helper class to navigate IIIF 2.x manifests

    Currently only the following document structure is accepted:
      - Manifest
        - has one ore more Sequence
          - has one or more Canvas
            - has one or more Image
    """

    def __init__(self, logger=Depends(get_logger)):
        self._logger = logger

    def by_type(self, parent, type):
        return list(filter(lambda item: item.type == type, parent.items))

    def is_image(self, image: Image):
        """
        Check if annotation presents a valid image
        """

        # TODO: extend as needed
        return image.resource.format == "image/jpeg"

    def extract_objects(self, manifest: Manifest):
        """
        Extract objects from manifest
        """

        return list(
            Iiif2Object(
                object_uuid=image.resource.id,
                object_data=Iiif2ObjectData(
                    manifest=manifest.id,
                    sequence=sequence.id,
                    canvas=canvas.id,
                    image=image.id,
                    service=image.resource.service,
                ),
            )
            # extract sequences from manifest
            for sequence in manifest.sequences
            # extract canvas from sequence
            for canvas in sequence.canvases
            # extract image from sequence
            for image in canvas.images
            if self.is_image(image)
        )
