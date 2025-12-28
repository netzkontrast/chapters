"""Configuration management using Pydantic Settings"""
import os
from pathlib import Path
from pydantic import field_validator, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    app_name: str = "Chapters API"
    debug: bool = False
    
    # Database
    database_url: str | None = None
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT
    secret_key: str = "dev_secret_key_change_me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # OpenAI
    openai_api_key: str | None = None
    
    # S3 Storage
    s3_bucket: str | None = None
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_endpoint_url: str | None = None  # For Cloudflare R2
    s3_region: str = "auto"
    
    # Sentry
    sentry_dsn: str | None = None
    
    # CORS
    cors_origins: list[str] = ["*"]

    # Rate Limits
    margin_rate_limit: int = 20  # per hour
    btl_invite_rate_limit: int = 3  # per day
    muse_prompt_rate_limit: int = 10  # per hour
    muse_rewrite_rate_limit: int = 15  # per hour
    muse_cover_rate_limit: int = 5  # per day
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str | None, info: ValidationInfo) -> str:
        if isinstance(v, str) and v:
            url = v
        else:
            # Fallback for Vercel Postgres
            url = os.getenv("POSTGRES_URL", "")

        if not url:
             # If we are in a context where we might not need DB (e.g. build), maybe we shouldn't fail?
             # But for runtime we need it.
             # We allow it to be empty for build steps, but app will likely fail on connection
             return ""

        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


# Global settings instance
try:
    settings = Settings()
except Exception as e:
    # During build time or if env vars are missing, this might fail.
    print(f"Failed to load settings: {e}")
    # Return a default instance for build time
    settings = Settings(
        database_url="sqlite:///./build.db",
        secret_key="build-key",
        openai_api_key="sk-build",
        s3_bucket="build-bucket",
        s3_access_key="build-key",
        s3_secret_key="build-secret"
    )
