import logging

from typing import Callable
from threading import Lock
from multiprocessing.pool import ThreadPool

from app.schemas.common import TaskStatus


LOG_FORMAT = "%(levelname)s:\t%(asctime)s\t%(message)s "
FORMATTER = logging.Formatter(LOG_FORMAT)


class TaskWrapper:
    def __init__(self, task: TaskStatus):
        self.task = task
        # capture the task log
        self.handler = logging.StreamHandler(self)
        self.handler.setFormatter(FORMATTER)
        self.logger = logging.getLogger(f"task-{task.id}")
        self.logger.addHandler(self.handler)

    def write(self, str):
        self.task.log.append(str)

    def flush(self):
        pass


class TaskManager:
    def __init__(self):
        self._pool = ThreadPool(processes=1)
        self._tasks: dict[TaskWrapper] = {}
        self._lock = Lock()

    def queue_tasks(self, tasks: list[TaskStatus], callback: Callable):
        with self._lock:
            for task in tasks:
                self._tasks[task.id] = TaskWrapper(task)

        self._pool.map_async(callback, tasks)

    def get_tasks(self):
        with self._lock:
            return list([task.task for task in self._tasks.values()])

    def update_status(self, id: str, status: str):
        with self._lock:
            self._tasks[id].task.status = status

    def get_logger(self, id: str):
        return self._tasks[id].logger


# shared thread pool
# shared task manager
task_manager = TaskManager()


def get_task_manager():
    return task_manager
