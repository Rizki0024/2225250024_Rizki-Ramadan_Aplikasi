"""Konfigurasi aplikasi dari environment variable (lihat .env.example)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_DIR / "app" / "data"

load_dotenv(BACKEND_DIR / ".env")

_DEV_JWT_SECRET = "dev-only-secret-ganti-di-produksi-0123456789"


@dataclass(frozen=True)
class Settings:
    supabase_url: str = ""
    supabase_secret_key: str = ""
    jwt_secret: str = _DEV_JWT_SECRET
    token_ttl_hours: int = 8
    allowed_origins: list[str] = field(default_factory=lambda: ["http://localhost:5173"])
    evaluation_minutes: int = 30
    submit_grace_seconds: int = 120
    local_data_dir: Path = BACKEND_DIR / ".localdata"
    login_max_failures: int = 5
    login_lock_seconds: int = 300
    anthropic_api_key: str = ""
    tutor_model: str = "claude-opus-5-5"
    tutor_max_requests: int = 30
    groq_api_key: str = ""
    groq_models: tuple[str, ...] = ()

    @property
    def storage_mode(self) -> str:
        return "supabase" if self.supabase_url and self.supabase_secret_key else "local"

    def validate(self) -> None:
        if self.storage_mode == "supabase":
            if self.jwt_secret == _DEV_JWT_SECRET or len(self.jwt_secret) < 32:
                raise RuntimeError(
                    "APP_JWT_SECRET wajib diisi (minimal 32 karakter acak) saat memakai Supabase."
                )


def load_settings() -> Settings:
    env = os.environ
    origins = [o.strip().rstrip("/") for o in env.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
    return Settings(
        supabase_url=env.get("SUPABASE_URL", "").strip().rstrip("/"),
        supabase_secret_key=env.get("SUPABASE_SECRET_KEY", "").strip(),
        jwt_secret=env.get("APP_JWT_SECRET", "").strip() or _DEV_JWT_SECRET,
        token_ttl_hours=int(env.get("TOKEN_TTL_HOURS", "8")),
        allowed_origins=[o for o in origins if o],
        evaluation_minutes=int(env.get("EVALUATION_MINUTES", "30")),
        local_data_dir=Path(env.get("LOCAL_DATA_DIR", str(BACKEND_DIR / ".localdata"))),
        anthropic_api_key=env.get("ANTHROPIC_API_KEY", "").strip(),
        tutor_model=env.get("TUTOR_MODEL", "claude-opus-5-5").strip() or "claude-opus-5-5",
        tutor_max_requests=int(env.get("TUTOR_MAX_REQUESTS", "30")),
        groq_api_key=env.get("GROQ_API_KEY", "").strip(),
        groq_models=tuple(m.strip() for m in env.get("GROQ_MODELS", "").split(",") if m.strip()),
    )
