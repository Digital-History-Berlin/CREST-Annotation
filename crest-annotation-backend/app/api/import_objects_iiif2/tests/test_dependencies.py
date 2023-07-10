import json
import os

from .... import schemas

from ..dependencies import Iiif2, Iiif2ObjectData
from ..schemas import Manifest, Service


def test_import_objects_iiif2():
    manifest = os.path.join(os.path.dirname(__file__), "example-book-1.json")
    with open(manifest, "r") as file:
        content = json.load(file)

    iiif2 = Iiif2(None)
    objects = iiif2.extract_objects(Manifest(**content))

    # number of objects
    assert len(objects) == 3

    # first object
    assert objects[0].object_uuid == "http://example.org/iiif/book1/res/page1.jpg"

    # specific data
    assert objects[0].object_data == Iiif2ObjectData(
        manifest="http://example.org/iiif/book1/manifest",
        sequence="http://example.org/iiif/book1/sequence/normal",
        canvas="http://example.org/iiif/book1/canvas/p1",
        service=Service(
            id="http://example.org/images/book1-page1",
            context="http://iiif.io/api/image/2/context.json",
            profile="http://iiif.io/api/image/2/level1.json",
        ),
    )

    # service
    uri = objects[0].object_data.get_image_uri(schemas.ImageRequest())
    assert uri == "http://example.org/images/book1-page1/full/full/0/default.jpg"
