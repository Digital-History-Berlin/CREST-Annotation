import json
import logging
import re

from SPARQLWrapper import SPARQLWrapper, JSON
from fastapi import HTTPException
from typing import Iterator

from app.models.objects import Object
from app.models.projects import Project
from .schemas import DigitalHeraldryAnnotationsConfig

from ..bundle_digital_heraldry import (
    DigitalHeraldryObjectData,
    SparqlBindings,
    SparqlQueryResponse,
    SparqlResults,
)


logger = logging.getLogger(__name__)


class DigitalHeraldryAnnotationsProvider:
    """
    Annotations provider for Digital Heraldry ontologies
    """

    type_id = "digital-heraldry"

    def _substitute_variables(self, query: str, variables: dict[str, str]) -> str:
        """
        Replace {{variable}} placeholders in query with actual values
        """

        result = query
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", value)
        return result

    def _get_project_custom_fields(self, project: Project) -> dict[str, str]:
        """
        Extract custom fields from project
        """

        if not project.custom_fields:
            return {}
        try:
            return json.loads(project.custom_fields)
        except json.JSONDecodeError:
            return {}

    def _get_object_variables(self, obj: Object, project: Project) -> dict[str, str]:
        """
        Extract template variables from object data and project custom fields
        """

        object_data = json.loads(obj.object_data) if obj.object_data else {}

        return {
            # override project data with object-specific data
            **self._get_project_custom_fields(project),
            **object_data.get("bindings"),
        }

    def _parse_iiif_shapes(self, iiif_url: str):
        """
        Extract shapes from IIIF image URL
        """

        # currently only rectangle supported
        match = re.search(r"/(\d+),(\d+),(\d+),(\d+)/", iiif_url)
        if match:
            return [
                {
                    "type": "Rectangle",
                    "x": int(match.group(1)),
                    "y": int(match.group(2)),
                    "width": int(match.group(3)),
                    "height": int(match.group(4)),
                }
            ]

        return []

    def _parse_label(self, binding: SparqlBindings) -> dict:
        reference = binding.optional("blazonType")
        name = binding.optional("blazonTextAnnotation")

        if reference:
            return {
                "reference": reference,
                "name": name,
            }

        return None

    def _parse_bindings(self, bindings: list[SparqlBindings]) -> Iterator[dict]:
        """
        Convert SPARQL result bindings to annotation format
        """

        for binding in bindings:
            annotation = binding.require("annotationImageFile")

            yield {
                "id": binding.require("blazon"),
                "label": self._parse_label(binding),
                "shapes": self._parse_iiif_shapes(annotation),
                "external": True,
                "locked": True,
            }

    def _parse_annotations(self, response: SparqlQueryResponse) -> list[dict]:
        return list(self._parse_bindings(response.results.bindings))

    def pull(self, data_object: Object, project: Project) -> list[dict]:
        """
        Pull annotations from ontology
        """

        try:
            config = DigitalHeraldryAnnotationsConfig(**json.loads(project.sync_config))
            variables = self._get_object_variables(data_object, project)
            query = self._substitute_variables(config.pull_query, variables)

            logger.info(f"Executing SPARQL query on {config.endpoint}")
            sparql = SPARQLWrapper(endpoint=config.endpoint, returnFormat=JSON)
            sparql.setQuery(query)

            result = sparql.queryAndConvert()
            response = SparqlQueryResponse(**result)
            return self._parse_annotations(response)

        except Exception as e:
            logger.exception("Unable to pull annotations")
            # forward the error to the frontend
            raise HTTPException(status_code=500, detail=str(e))

    def push(self, obj: Object, annotations: list[dict], project: Project) -> None:
        """
        Push annotations to ontology
        """

        try:
            config = DigitalHeraldryAnnotationsConfig(**json.loads(project.sync_config))
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid configuration")

        if not config.push_queries:
            logger.info("No push queries configured")
            return

        variables = self._get_object_variables(obj, project)

        # TODO: Implement push logic
        # For each annotation:
        # 1. Generate representationIRI
        # 2. Construct croppedImageLink from bbox
        # 3. Execute ASK query to check existence
        # 4. Execute INSERT query if not exists
        logger.info(f"Push not yet implemented for {len(annotations)} annotations")
