import json

from pydantic import BaseModel, Field
from fastapi import Depends, HTTPException
from iiif_prezi3 import Manifest, Annotation, Service

from app.dependencies.logger import get_logger
from app import schemas

from ..service_image_iiif import iiif3, iiif2, iiif1


class Iiif3ObjectData(BaseModel):
    """
    Specific data for objects imported from IIIF 3.0
    """

    type = Field(default="iiif3", const=True)

    manifest: str
    page: str
    annotation: str
    canvas: str

    service: Service

    def get_image_uri(self, usage: schemas.ImageRequest):
        # try all services until one works
        for service in self.service.__root__:

            # IIIF 3.0 Image API
            if service.type == "ImageService3":
                return iiif3.get_image_uri(service.id, usage)
            # IIIF 2.x Image API
            if service.type == "ImageService2":
                return iiif2.get_image_uri(service.id, usage)
            # IIIF 2.x Image API
            if service.type == "ImageService1":
                return iiif1.get_image_uri(service.id, usage)

        raise HTTPException(status_code=404, detail="No compatible image service")

    def get_image_description(self):
        return self.canvas


class Iiif3Object(BaseModel):
    object_uuid: str
    object_data: Iiif3ObjectData


class Iiif3Import(BaseModel):
    title: dict[str, list[str]] | None
    display: str | None
    objects: list[Iiif3Object]
    added: list[Iiif3Object]
    problems: list[str]


class Iiif3:
    """
    Helper class to navigate IIIF 3.0 manifests

    Currently only the following document structure is accepted:
      - Manifest
        - has one ore more Canvas
          - has one or more AnnotationPage
            - Annotation
              - Image
    """

    def __init__(self, logger=Depends(get_logger)):
        self._logger = logger

    def by_type(self, parent, type):
        return list(filter(lambda item: item.type == type, parent.items))

    def is_image(self, item: Annotation):
        """
        Check if annotation presents a valid image
        """

        return (
            item.type == "Annotation"
            and item.motivation == "painting"
            and item.body.type == "Image"
        )

    def extract_objects(self, manifest: Manifest) -> list[Iiif3Object]:
        """
        Extract objects from manifest
        """

        return list(
            Iiif3Object(
                object_uuid=item.body.id,
                object_data=Iiif3ObjectData(
                    manifest=manifest.id,
                    canvas=canvas.id,
                    page=page.id,
                    annotation=item.id,
                    service=item.body.service,
                ),
            )
            # extract canvas from manifest
            for canvas in manifest.items
            if canvas.type == "Canvas"
            # extract page from canvas
            for page in canvas.items
            if page.type == "AnnotationPage"
            # extract annotation from page
            for item in page.items
            if self.is_image(item)
        )
