from fastapi import Depends

from .db import get_db
from .logger import get_logger
from ..models.settings import Setting


# TODO: maybe load settings on startup and keep dependency alive
class Settings:
    def __init__(self, db=Depends(get_db), logger=Depends(get_logger)):
        self._db = db
        self._logger = logger

    def get(self, key):
        setting: Setting = self._db.query(Setting).filter_by(key=key).first()

        self._logger.debug(f"setting {key} = {setting.value}")

        # TODO: handle missing setting
        return setting.value
