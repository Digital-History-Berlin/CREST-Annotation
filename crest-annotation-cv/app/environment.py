from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", ".env.local"))

    environment: str
    cors_origins: str

    # sam configuration
    sam_checkpoint: str
    sam_model_type: str
    sam_device: str | None = None

    # sam2 configuration
    sam2_checkpoint: str
    sam2_config: str


env = Environment()
