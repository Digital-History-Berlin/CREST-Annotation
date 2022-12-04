from pydantic import BaseSettings


class Environment(BaseSettings):
    cors_origins: str
    database_url: str
    database_password: str

    class Config:
        env_file = ".env", ".env.local"


env = Environment()
