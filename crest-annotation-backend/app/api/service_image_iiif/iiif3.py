import requests

from pydantic import BaseModel, Field

from ... import schemas


class Iiif3ImageSize(BaseModel):
    width: int
    height: int


class Iiif3ImageService(BaseModel):
    """
    Defines a (incomplete) response as retrieved from IIIF3 image server
    """

    # meta data
    context: str | list[str] = Field(alias="@context")
    type: str = Field("ImageService3", const=True)

    # image data
    width: int
    height: int
    sizes: list[Iiif3ImageSize] | None


def service_image_iiif3(base_url, usage: schemas.ImageRequest):
    """
    Request image from IIIF 3 image server
    """

    if not usage.width and not usage.height:
        return f"{base_url}/full/max/0/default.jpg"

    # request service info
    json_resonse = requests.get(base_url).json()
    service = Iiif3ImageService(**json_resonse)

    # calculate optimal sizes
    width = usage.width or 0
    height = usage.height or 0

    w = round(max(width, height * service.width / service.height))
    h = round(max(height, width * service.height / service.width))

    # TODO: respect available sizes

    return f"{base_url}/full/{w},{h}/0/default.jpg"
