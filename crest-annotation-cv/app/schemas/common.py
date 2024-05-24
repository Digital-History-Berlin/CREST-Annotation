from pydantic import BaseModel


class Position(BaseModel):
    x: float
    y: float


class TaskInfo(BaseModel):
    id: str
    name: str


class AlgorithmInfo(BaseModel):
    id: str
    name: str
    frontend: str
    tasks: list[TaskInfo] | None = None


class Info(BaseModel):
    algorithms: list[AlgorithmInfo]


class TaskStatus(BaseModel):
    id: str
    project_id: str
    object_id: str
    status: str
