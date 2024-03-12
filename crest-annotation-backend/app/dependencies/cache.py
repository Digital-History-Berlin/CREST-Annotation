import os
import hashlib
import base64
import pathlib

from typing import Callable
from fastapi import Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from urllib import request

from ..dependencies.logger import get_logger
from ..environment import env
from .. import schemas


# ensure the cache path exists
if env.image_cache:
    pathlib.Path(env.image_cache_path).mkdir(
        parents=True,
        exist_ok=True,
    )


class Entry(BaseModel):
    object_id: str
    usage: schemas.ImageRequest

    @property
    def file(self) -> str:
        """
        Generate a unique filename for this entry
        """
        descriptor = f"{self.object_id}#{self.usage.dict()}"
        return hashlib.sha256(
            descriptor.encode("utf-8"),
            usedforsecurity=False,
        ).hexdigest()


class Cache:
    """
    Simple file based caching
    """

    def __init__(
        self,
        logger=Depends(get_logger),
    ):
        self._path = env.image_cache_path
        self._duration = env.image_cache_duration
        self._logger = logger

    def encode(self, object_id: str, usage: schemas.ImageRequest) -> str:
        """
        Encode the URL so it can be passed safely as filename or inside another URL
        """
        # base32 encoding fits the needs
        return base64.b32encode(
            Entry(
                object_id=object_id,
                usage=usage,
            )
            .json()
            .encode("utf-8")
        ).decode("ascii")

    def decode(self, encoded: str) -> Entry:
        """
        Decode the URL to retrieve cache entry
        """
        # base32 encoding fits the needs
        return Entry.parse_raw(base64.b32decode(encoded.encode("ascii")))

    def load(self, url: str, file: str):
        """
        Load the given URL and store in cache
        """

        self._logger.debug(f"Caching {url} as {file}")
        path = os.path.join(self._path, file)
        request.urlretrieve(url, path)

        return path

    def get(self, encoded: str, resolve: Callable[[str, schemas.ImageRequest], str]):
        """
        Retrieve the given URL from cache or load if missing
        """

        entry = self.decode(encoded)
        try:
            self._logger.debug(f"Requested cached {entry.file}")
            stat = os.stat(os.path.join(self._path, entry.file))

            # validate the cache object
            if self._duration > 0:
                modified = datetime.fromtimestamp(stat.st_mtime)
                age = (datetime.now() - modified).total_seconds()
                assert age < self._duration, "outdated"

            return os.path.join(self._path, entry.file)

        except Exception as exception:
            self._logger.debug(f"Missing cached {entry.file} ({exception})")
            url = resolve(entry.object_id, entry.usage)

            return self.load(url, entry.file)
