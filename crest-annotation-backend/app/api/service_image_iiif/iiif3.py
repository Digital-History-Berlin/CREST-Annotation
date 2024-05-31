import requests

from pydantic import BaseModel, Field

from app import schemas
from . import cache


class Iiif3ImageSize(BaseModel):
    width: int
    height: int


class Iiif3ImageService(BaseModel):
    """
    Defines a (incomplete) response as retrieved from IIIF 3 image server
    """

    # meta data
    context: str | list[str] = Field(alias="@context")
    type: str = Field("ImageService3", const=True)

    # image data
    width: int
    height: int
    sizes: list[Iiif3ImageSize] | None


def get_image_uri(uri, usage: schemas.ImageRequest):
    """
    Get image URI from IIIF 3 image server
    """

    if not usage.width and not usage.height:
        return f"{uri}/full/max/0/default.jpg"

    # request service info
    json_resonse = cache.get(uri).json()
    service = Iiif3ImageService(**json_resonse)

    # calculate optimal sizes
    width = usage.width or 0
    height = usage.height or 0

    w = round(max(width, height * service.width / service.height))
    h = round(max(height, width * service.height / service.width))

    # TODO: respect available sizes

    return f"{uri}/full/{w},{h}/0/default.jpg"
