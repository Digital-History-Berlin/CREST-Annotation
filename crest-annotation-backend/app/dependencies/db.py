import math

from typing import Callable

from sqlalchemy.orm import Query as SqlQuery
from fastapi import Query

from ..database import SessionLocal
from .. import schemas


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_paginate(page: int = Query(ge=1), size: int = Query()):
    def paginate(query: SqlQuery, transform: Callable):
        items = list(map(transform, query.offset((page - 1) * size).limit(size)))
        total = query.count()

        return schemas.Paginated(
            items=items, pages=math.ceil(total / size), page=page, size=page
        )

    return paginate
