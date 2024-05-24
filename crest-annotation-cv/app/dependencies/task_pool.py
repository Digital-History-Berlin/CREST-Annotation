import logging

from typing import Callable
from threading import Lock
from multiprocessing.pool import ThreadPool

from app.schemas.common import TaskStatus


class TaskManager:
    def __init__(self):
        self._pool = ThreadPool(processes=1)
        self._tasks: dict[TaskStatus] = {}
        self._lock = Lock()

    def queue_tasks(self, tasks: list[TaskStatus], callback: Callable):
        with self._lock:
            for task in tasks:
                self._tasks[task.id] = task

        self._pool.map_async(callback, tasks)

    def get_tasks(self):
        with self._lock:
            return list(self._tasks.values())

    def update_status(self, id: str, status: str):
        with self._lock:
            self._tasks[id].status = status


# shared thread pool
# shared task manager
task_manager = TaskManager()


def get_task_manager():
    return task_manager
