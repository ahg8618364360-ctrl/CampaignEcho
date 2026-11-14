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

    # Authentication & Session Security (OWASP minimum 32 chars, strictly non-placeholder)
    CAMPAIGNECHO_AUTH_SECRET: Optional[str] = None

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

    # Z.ai LLM Configuration (OpenAI-compatible)
    ZAI_API_KEY: Optional[str] = None
    LLM_BASE_URL: Optional[str] = None
    ZAI_BASE_URL: str = "https://open.bigmodel.cn/api/paas/v4"
    ZAI_MODEL: str = "glm-4.5-flash"
    ZAI_TEMPERATURE: float = 0.7
    ZAI_MAX_TOKENS: int = 8192

    # Active LLM Provider: "zai" (verified working production provider)
    # Groq fallback is disabled until valid active credentials and model (openai/gpt-oss-120b) are verified.
    LLM_PROVIDER: str = "zai"
    LLM_FALLBACK_ENABLED: bool = False

    @property
    def effective_zai_url(self) -> str:
        """Canonical Z.ai API URL, prioritizing LLM_BASE_URL if set."""
        return self.LLM_BASE_URL or self.ZAI_BASE_URL

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


def validate_auth_secret(secret: Optional[str] = None) -> str:
    """Validate that CAMPAIGNECHO_AUTH_SECRET is configured, strong, and non-placeholder.
    
    Enforces fail-closed security at application boot:
    - Must be set (non-empty)
    - Must not match common placeholders or default secrets
    - Must be at least 32 characters in length
    """
    import os
    if secret is not None:
        raw = secret
    else:
        raw = os.environ.get("CAMPAIGNECHO_AUTH_SECRET") or settings.CAMPAIGNECHO_AUTH_SECRET

    if not raw or not raw.strip():
        raise RuntimeError("FATAL: CAMPAIGNECHO_AUTH_SECRET is missing. Server refusing to start with undefined signing key.")
    
    val = raw.strip()
    if len(val) < 32:
        raise RuntimeError(f"FATAL: CAMPAIGNECHO_AUTH_SECRET is too short ({len(val)} chars). Minimum 32 characters required.")
        
    lower = val.lower()
    placeholders = [
        "your_auth_secret",
        "placeholder",
        "changeme",
        "secret_key",
        "default_secret",
        "campaignecho-secure-secret-key",
        "todo",
        "xxxx",
    ]
    for ph in placeholders:
        if ph in lower:
            raise RuntimeError(f"FATAL: CAMPAIGNECHO_AUTH_SECRET contains forbidden placeholder '{ph}'.")
            
    return val

