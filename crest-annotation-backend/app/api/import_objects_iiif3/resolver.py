from fastapi import HTTPException

from ... import schemas

from ..service_image_iiif import service_image_iiif3


def iiif3_image_resolver(uri_data, usage: schemas.ImageRequest):
    """
    Provide a image URI from a IIIF 3 service specification
    """

    # try all services until one works
    for service_data in uri_data.get("service", []):
        service = None

        base_url = service_data.get("id")
        if not base_url:
            continue

        # select the correct service
        if service_data.get("type") == "ImageService3":
            service = service_image_iiif3

        if service:
            return service(base_url, usage)

    return HTTPException(status_code=404, detail="No compatible image service found")
