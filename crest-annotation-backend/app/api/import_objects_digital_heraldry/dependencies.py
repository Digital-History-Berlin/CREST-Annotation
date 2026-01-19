import json

from pydantic import BaseModel, Field
from fastapi import Depends
from typing import Iterator

from app.dependencies.logger import get_logger
from app import schemas

from ..bundle_digital_heraldry import (
    DigitalHeraldryObjectData,
    SparqlQueryResponse,
    SparqlResults,
)


class DigitalHeraldryObject(BaseModel):
    object_uuid: str
    object_data: DigitalHeraldryObjectData


class DigitalHeraldryImport(BaseModel):
    objects: list[DigitalHeraldryObject]
    added: list[DigitalHeraldryObject]
    problems: list[str]


class DigitalHeraldry:
    """
    Helper class to navigate Digital Heraldry ontologies
    """

    def __init__(self, logger=Depends(get_logger)):
        self._logger = logger

    def extract_bindings(
        self, results: SparqlResults
    ) -> Iterator[DigitalHeraldryObject]:
        for bindings in results.bindings:
            try:
                yield DigitalHeraldryObject(
                    object_uuid=bindings["canvas"].value,
                    object_data=DigitalHeraldryObjectData(
                        manifest=bindings["manifestIRI"].value,
                        image=bindings["imageURL"].value,
                        bindings={
                            # ensure bindings are stored for later use
                            key: binding.value
                            for key, binding in bindings.items()
                        },
                    ),
                )
            except:
                # TODO: improve error handling
                self._logger.exception(f"Unexpected bindings: {bindings}")

    def extract_objects(
        self,
        response: SparqlQueryResponse,
    ) -> list[DigitalHeraldryObject]:
        """
        Extract objects from manifest
        """

        return list(self.extract_bindings(response.results))
