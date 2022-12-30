from enum import auto

from fastapi_utils.enums import StrEnum
from sqlalchemy import desc


class SortDirection(StrEnum):
    asc = auto()
    desc = auto()

    def apply(self, sorting):
        """
        Shorthand to use sort direction with SQLalchemy
        """

        if self == SortDirection.asc:
            return sorting
        if self == SortDirection.desc:
            return map(desc, sorting)
        raise Exception(f"Invalid sorting {sorting}")
