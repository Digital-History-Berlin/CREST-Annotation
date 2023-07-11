from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", ".env.local"))

    environment: str
    cors_origins: str


env = Environment()
