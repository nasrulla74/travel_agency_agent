from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "TravelMate AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    DATABASE_URL: str = "sqlite:///./travelmate.db"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    OPENAI_API_KEY: Optional[str] = None
    STRIPE_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"


settings = Settings()
