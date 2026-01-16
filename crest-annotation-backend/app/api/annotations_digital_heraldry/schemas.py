from pydantic import BaseModel


class DigitalHeraldryAnnotationsConfig(BaseModel):
    """
    Specifies frontend configuration options
    """

    endpoint: str
    pull_query: str
    push_queries: dict[str, str] | None = None
