from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.schemas.common import Info, AlgorithmInfo, TaskInfo, TaskStatus
from app.dependencies.task_pool import get_task_manager


router = APIRouter()


@router.get("/info", response_model=Info)
async def info():
    return JSONResponse(
        jsonable_encoder(
            Info(
                algorithms=[
                    AlgorithmInfo(
                        id="facebook-sam-onnx",
                        name="Segment Anything (Meta AI) + ONNX",
                        frontend="sam-onnx",
                        tasks=[TaskInfo(id="prepare", name="Prepare embeddings")],
                    ),
                    AlgorithmInfo(
                        id="facebook-sam",
                        name="Segment Anything (Meta AI)",
                        frontend="generic-single-mask",
                    ),
                    AlgorithmInfo(
                        id="facebook-sam2",
                        name="Segment Anything 2 (Meta AI)",
                        frontend="generic-single-mask",
                    ),
                    AlgorithmInfo(
                        id="custom-crest-detection",
                        name="Crest Detection (Custom)",
                        frontend="crest-detection",
                        tasks=[TaskInfo(id="prepare", name="Prepare segmentations")],
                    ),
                ]
            )
        )
    )


@router.get("/tasks/{project_id}", response_model=list[TaskStatus])
async def status(project_id: str, task_manager=Depends(get_task_manager)):
    tasks = task_manager.get_tasks()
    project_tasks = list([task for task in tasks if task.project_id == project_id])

    return JSONResponse(jsonable_encoder(project_tasks))
