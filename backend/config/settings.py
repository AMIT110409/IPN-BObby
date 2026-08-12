"""
Bobby — Settings (Dual Config: Supabase demo / Azure production)
================================================================
Usage:
  from config.settings import settings

  # Access config:
  settings.openai_api_key
  settings.freshdesk_domain
  settings.is_demo   # True if APP_ENV=demo
"""
from __future__ import annotations
from enum import Enum
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnv(str, Enum):
    DEMO = "demo"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: AppEnv = AppEnv.DEMO
    app_name: str = "Bobby"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── LLM — Demo (OpenAI direct) ────────────────────────────────────────────
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"

    # ── LLM — Production (Azure OpenAI) ──────────────────────────────────────
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_embedding_deployment: str = "text-embedding-3-large"
    azure_openai_api_version: str = "2024-02-01"

    # ── Supabase (demo) ───────────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # ── Azure PostgreSQL (production) ─────────────────────────────────────────
    azure_postgres_host: str = ""
    azure_postgres_db: str = "bobby"
    azure_postgres_user: str = ""
    azure_postgres_password: str = ""
    azure_postgres_port: int = 5432

    # ── Azure AI Search (production) ──────────────────────────────────────────
    azure_search_endpoint: str = ""
    azure_search_api_key: str = ""
    azure_search_index_name: str = "bobby-knowledge"

    # ── Freshdesk ─────────────────────────────────────────────────────────────
    freshdesk_api_key: str = ""
    freshdesk_domain: str = ""  # e.g. acme.freshdesk.com

    # ── Microsoft Graph API ───────────────────────────────────────────────────
    graph_tenant_id: str = ""
    graph_client_id: str = ""
    graph_client_secret: str = ""

    # ── Langfuse ──────────────────────────────────────────────────────────────
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    # ── Derived helpers ───────────────────────────────────────────────────────
    @property
    def is_demo(self) -> bool:
        return self.app_env == AppEnv.DEMO

    @property
    def is_production(self) -> bool:
        return self.app_env == AppEnv.PRODUCTION

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def database_url(self) -> str:
        """Returns the correct DB connection string based on environment."""
        if self.is_demo:
            # Supabase connection string (transaction mode, port 6543)
            return (
                f"postgresql+asyncpg://{self.supabase_url.replace('https://', '')}"
                if not self.azure_postgres_host
                else f"postgresql+asyncpg://bobby_user:bobby_local_pass@localhost:5432/bobby"
            )
        return (
            f"postgresql+asyncpg://{self.azure_postgres_user}:{self.azure_postgres_password}"
            f"@{self.azure_postgres_host}:{self.azure_postgres_port}/{self.azure_postgres_db}"
        )

    @property
    def llm_api_key(self) -> str:
        return self.openai_api_key if self.is_demo else self.azure_openai_api_key

    @property
    def llm_model(self) -> str:
        return self.openai_model if self.is_demo else self.azure_openai_deployment


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
