from fastapi import Depends

from ...dependencies.logger import get_logger


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

    def get_thumbnail(self, image):
        """
        Get the best thumbnail service
        """

        if image.service is not None:
            # TODO: select appropriate service
            return f"iiif3://{image.service[0]}"

        return None

    def extract_images(self, manifest):
        """
        Extract images from manifest
        """

        return list(
            {
                "uri": item.body.id,
                "thumbnail_uri": self.get_thumbnail(item.body),
                "object_data": {
                    "canvas": canvas.id,
                    "page": page.id,
                    "annotation": item.id,
                },
            }
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
