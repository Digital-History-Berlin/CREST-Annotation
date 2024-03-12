from pydantic import BaseSettings


class Environment(BaseSettings):
    cors_origins: str
    database_url: str
    database_password: str

    image_cache: bool = False
    image_cache_url: str = "/objects/cache"
    image_cache_duration: int = 0
    image_cache_path: str = "./cache"

    class Config:
        env_file = ".env", ".env.local"


env = Environment()
