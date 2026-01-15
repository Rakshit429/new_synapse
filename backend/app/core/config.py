from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Database
    DATABASE_URL: str

    # Microsoft
    MS_CLIENT_ID: str
    MS_CLIENT_SECRET: str
    MS_TENANT_ID: str
    MS_REDIRECT_URI: str

    class Config:
        env_file = ".env"

settings = Settings()