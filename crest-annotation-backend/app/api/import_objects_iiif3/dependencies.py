import json

from fastapi import Depends
from iiif_prezi3 import Manifest, Canvas

from ...dependencies.logger import get_logger
from . import schemas


class Iiif3:
    """
    Helper class to navigate IIIF 3.0.0 manifests

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

    def is_image(self, item):
        """
        Check if annotation presents a valid image
        """

        return (
            item.type == "Annotation"
            and item.motivation == "painting"
            and item.body.type == "Image"
        )

    def get_thumbnail(self, image: list[Canvas]):
        """
        Get the best thumbnail service
        """

        if image.service is not None:
            return json.dumps(
                {
                    "resolver": "iiif3",
                    "service": list(service.dict() for service in image.service),
                }
            )

        return None

    def extract_objects(self, manifest: Manifest):
        """
        Extract objects from manifest
        """

        return list(
            schemas.Iiif3Object(
                object_uuid=item.body.id,
                image_uri=json.dumps(item.body.id),
                thumbnail_uri=self.get_thumbnail(item.body),
                object_data=json.dumps(
                    {
                        "type": "iiif3",
                        "canvas": canvas.id,
                        "page": page.id,
                        "annotation": item.id,
                    }
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
