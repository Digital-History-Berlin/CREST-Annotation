import os
import hashlib
import base64
import pathlib
import threading
import urllib.request

from typing import Callable
from fastapi import Depends
from pydantic import BaseModel
from datetime import datetime

from ..dependencies.logger import get_logger
from ..environment import env
from .. import schemas


# ensure the cache path exists
if env.image_cache:
    pathlib.Path(env.image_cache_path).mkdir(
        parents=True,
        exist_ok=True,
    )


# inject uer agent to avoid being blocked by IIIF servers
# TODO: make this configurable
USER_AGENT = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
}


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
        concurreny_limit: int = 3,
    ):
        self._path = env.image_cache_path
        self._duration = env.image_cache_duration
        self._logger = logger

        # limit the number of concurrent requests
        self._semaphore = threading.Semaphore(concurreny_limit)

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

        # limit concurrent downloads to avoid overwhelming IIIF servers
        with self._semaphore:
            # use browser-like headers to avoid 403 from IIIF servers
            req = urllib.request.Request(url, headers=USER_AGENT)
            with urllib.request.urlopen(req, timeout=30) as response:
                with open(path, "wb") as out_file:
                    out_file.write(response.read())

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
