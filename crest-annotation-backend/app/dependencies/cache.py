import os
import base64
import pathlib

from fastapi import Depends
from datetime import datetime, timedelta
from urllib import request

from ..dependencies.logger import get_logger
from ..environment import env


# ensure the cache path exists
if env.image_cache:
    pathlib.Path(env.image_cache_path).mkdir(
        parents=True,
        exist_ok=True,
    )


class Cache:
    """
    Simple file based caching
    """

    def __init__(
        self,
        logger=Depends(get_logger),
    ):
        self._path = env.image_cache_path
        self._duration = timedelta(seconds=env.image_cache_duration)
        self._logger = logger

    def encode(self, url: str) -> str:
        """
        Encode the URL so it can be passed safely as filename or inside another URL
        """
        # base32 encoding fits the needs
        return base64.b32encode(url.encode("utf-8")).decode("ascii")

    def decode(self, encoded: str) -> str:
        """
        Decode the URL
        """
        # base32 encoding fits the needs
        return base64.b32decode(encoded.encode("ascii")).decode("utf-8")

    def load(self, url: str):
        """
        Load the given URL and store in cache
        """

        encoded = self.encode(url)
        path = os.path.join(self._path, encoded)
        request.urlretrieve(url, path)

        self._logger.debug(f"Cached {url} as {path}")
        return path

    def get(self, encoded: str):
        """
        Retrieve the given URL from cache or load if missing
        """

        url = self.decode(encoded)
        try:
            self._logger.debug(f"Requested cached {url}")

            # validate the cache object
            stat = os.stat(os.path.join(self._path, encoded))
            modified = datetime.fromtimestamp(stat.st_mtime)
            assert modified > datetime.now() - self._duration

            return os.path.join(self._path, encoded)
        except:
            self._logger.debug(f"Missing cached {url}")
            # file not cached
            return self.load(url)
