import json
import os

from iiif_prezi3 import Manifest, Service, ServiceItem

from .... import schemas

from ..dependencies import Iiif3, Iiif3ObjectData


def test_import_objects_iiif3():
    manifest = os.path.join(os.path.dirname(__file__), "cookbook-0009-book-1.json")
    with open(manifest, "r") as file:
        content = json.load(file)

    iiif3 = Iiif3(None)
    objects = iiif3.extract_objects(Manifest(**content))

    # number of objects
    assert len(objects) == 5

    # first object
    assert (
        objects[0].object_uuid
        == "https://iiif.io/api/image/3.0/example/reference/59d09e6773341f28ea166e9f3c1e674f-gallica_ark_12148_bpt6k1526005v_f18/full/max/0/default.jpg"
    )

    # specific data
    assert objects[0].object_data == Iiif3ObjectData(
        manifest="https://iiif.io/api/cookbook/recipe/0009-book-1/manifest.json",
        canvas="https://iiif.io/api/cookbook/recipe/0009-book-1/canvas/p1",
        page="https://iiif.io/api/cookbook/recipe/0009-book-1/page/p1/1",
        annotation="https://iiif.io/api/cookbook/recipe/0009-book-1/annotation/p0001-image",
        service=Service.parse_obj(
            [
                ServiceItem(
                    id="https://iiif.io/api/image/3.0/example/reference/59d09e6773341f28ea166e9f3c1e674f-gallica_ark_12148_bpt6k1526005v_f18",
                    type="ImageService3",
                    profile="level1",
                )
            ]
        ),
    )

    # service
    uri = objects[0].object_data.get_image_uri(schemas.ImageRequest())
    assert (
        uri
        == "https://iiif.io/api/image/3.0/example/reference/59d09e6773341f28ea166e9f3c1e674f-gallica_ark_12148_bpt6k1526005v_f18/full/max/0/default.jpg"
    )
