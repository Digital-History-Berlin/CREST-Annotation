import requests

from pydantic import BaseModel, Field

from ... import schemas
from . import cache


class Iiif1ImageSize(BaseModel):
    width: int
    height: int


class Iiif1ImageService(BaseModel):
    """
    Defines a (incomplete) response as retrieved from IIIF 1.x image server
    """

    # image data
    width: int
    height: int


def get_image_uri(uri, usage: schemas.ImageRequest):
    """
    Request image from IIIF 1.x image server
    """

    if not usage.width and not usage.height:
        return f"{uri}/full/full/0/native.jpg"

    # request service info
    json_resonse = cache.get(f"{uri}/info.json").json()
    service = Iiif1ImageService(**json_resonse)

    # calculate optimal sizes
    width = usage.width or 0
    height = usage.height or 0

    w = round(max(width, height * service.width / service.height))
    h = round(max(height, width * service.height / service.width))

    return f"{uri}/full/{w},{h}/0/native.jpg"
