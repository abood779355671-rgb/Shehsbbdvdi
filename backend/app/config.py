from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    APP_NAME: str = "YouTube Downloader"
    SECRET_KEY: str = "super-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DATABASE_URL: str = "sqlite:///./ytdl.db"
    REDIS_URL: str = "redis://redis:6379/0"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "abood123"

    DOWNLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "downloads")
    MAX_DOWNLOAD_SIZE_MB: int = 2048

    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
