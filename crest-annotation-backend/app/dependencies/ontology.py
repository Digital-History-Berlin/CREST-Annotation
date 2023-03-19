# TODO: rewrite using pydantic

from fastapi import Depends

from .logger import get_logger


class OntologyMetaData:
    """
    Helper class to extract meta data
    """

    def __init__(self, data):
        self._data = data

        self.creators = self._data.get("http://purl.org/dc/terms/creator", [])
        self.titles = self._data.get("http://purl.org/dc/terms/title", [])
        self.licenses = self._data.get("http://purl.org/dc/terms/license", [])
        self.descriptions = self._data.get("http://purl.org/dc/terms/description", [])

    def _creator_json(self, creator):
        """
        Simplify creator data
        """
        return creator.get("@value")

    def _title_json(self, title):
        """
        Simplify title data
        """
        return title.get("@value")

    def _license_json(self, license):
        """
        Simplify license identifier
        """
        return license.get("@id")

    def _description_json(self, description):
        """
        Simplify description data
        """
        return {
            "language": description.get("@language"),
            "value": description.get("@value"),
        }

    def json(self):
        """
        Return meta data as simplified JSON
        """
        return {
            "creators": list(map(self._creator_json, self.creators)),
            "titles": list(map(self._title_json, self.titles)),
            "licenses": list(map(self._license_json, self.licenses)),
            "descriptions": list(map(self._description_json, self.descriptions)),
        }


class Ontology:
    """
    Helper class to navigate ontolgies
    """

    def __init__(self, logger=Depends(get_logger)):
        self._logger = logger

        self.ontology_id = "http://www.w3.org/2002/07/owl#Ontology"
        self.class_id = "http://www.w3.org/2002/07/owl#Class"
        self.label_id = "http://www.w3.org/2000/01/rdf-schema#label"
        self.sub_class_of_id = "http://www.w3.org/2000/01/rdf-schema#subClassOf"

    def has_tags(self, item, tags):
        """
        Check if the given item has all given tags
        """

        for tag in tags:
            if tag not in item:
                return False

        return True

    def by_type(self, items, type_id):
        """
        Filter items by @type
        """

        return list(
            filter(
                lambda item: type_id in item.get("@type", []),
                items,
            )
        )

    def first_by_type(self, items, type_id, fallback=None):
        """
        First item by @type
        """

        return next(
            filter(
                lambda item: type_id in item.get("@type", []),
                items,
            ),
            fallback,
        )

    def with_tags(self, items, tags):
        """
        Filter items by required tags
        """

        return list(
            filter(
                lambda item: self.has_tags(item, tags),
                items,
            )
        )

    def get_label(self, item):
        """
        Return value of first label with @value
        """

        labels = item.get(self.label_id, [])
        for label in labels:
            value = label.get("@value")
            if value is not None:
                return value

        return None

    def get_parents(self, item):
        """
        Return values of all subClassOf
        """

        parents = item.get(self.sub_class_of_id)
        if parents is None:
            return None

        parent_ids = []
        for parent in parents:
            parent_id = parent.get("@id")
            if parent_id is not None:
                parent_ids.append(parent_id)

        return parent_ids

    def as_tree(self, items, inflate=None):
        """
        Get the items as tree structure

        The inflate method can be used to add additional properties
        for each item in the tree (i.e. extract them from the ontology).
        """

        if inflate is None:
            # fallback for inflation
            inflate = lambda item: {}

        roots = []
        nodes = {
            item["@id"]: {
                "id": item["@id"],
                "parents": self.get_parents(item),
                "children": [],
                # add user items
                **inflate(item),
            }
            for item in items
            if "@id" in item
        }

        for node in nodes.values():

            # root label
            if not node["parents"]:
                roots.append(node)
                continue

            # node label
            for parent_id in node["parents"]:
                parent = nodes.get(parent_id)
                if parent is not None:
                    parent["children"].append(node)

        return roots

    def get_meta_data(self, data):
        """
        Get meta data
        """

        return OntologyMetaData(self.first_by_type(data, self.ontology_id, {}))
