import requests

from pydantic import BaseModel, Field

from app import schemas
from . import cache


class Iiif2ImageSize(BaseModel):
    width: int
    height: int


class Iiif2ImageService(BaseModel):
    """
    Defines a (incomplete) response as retrieved from IIIF 2.x image server
    """

    # meta data
    context: str = Field(
        alias="@context",
        default="http://iiif.io/api/image/2/context.json",
        const=True,
    )

    # image data
    width: int
    height: int
    sizes: list[Iiif2ImageSize] | None


def get_image_uri(uri, usage: schemas.ImageRequest):
    """
    Request image from IIIF 2.x image server
    """

    if not usage.width and not usage.height:
        return f"{uri}/full/full/0/default.jpg"

    # request service info
    json_resonse = cache.get(f"{uri}/info.json").json()
    service = Iiif2ImageService(**json_resonse)

    # calculate optimal sizes
    width = usage.width or 0
    height = usage.height or 0

    w = round(max(width, height * service.width / service.height))
    h = round(max(height, width * service.height / service.width))

    # TODO: respect available sizes

    return f"{uri}/full/{w},{h}/0/default.jpg"
