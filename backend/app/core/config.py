from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application Configuration Settings."""

    ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Server Binding
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./campaignecho.db"

    # CORS Origins (Allowing local Next.js development)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Application Version
    VERSION: str = "0.1.0"

    # Vectorize Hindsight Configuration
    # Official Cloud: https://api.hindsight.vectorize.io
    # Local Server: http://localhost:8888
    HINDSIGHT_API_URL: str = "https://api.hindsight.vectorize.io"
    HINDSIGHT_BASE_URL: Optional[str] = None
    HINDSIGHT_API_KEY: Optional[str] = None
    HINDSIGHT_TIMEOUT: float = 30.0
    HINDSIGHT_MAX_RETRIES: int = 3

    # Groq Cloud LLM Configuration
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_TEMPERATURE: float = 0.7
    GROQ_MAX_TOKENS: int = 4096

    @property
    def effective_hindsight_url(self) -> str:
        """Canonical Hindsight API URL, supporting HINDSIGHT_API_URL with HINDSIGHT_BASE_URL fallback."""
        return self.HINDSIGHT_BASE_URL or self.HINDSIGHT_API_URL

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
