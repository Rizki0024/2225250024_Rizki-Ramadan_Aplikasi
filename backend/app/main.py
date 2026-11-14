"""Titik masuk FastAPI: `uvicorn app.main:app --reload`."""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import attempts, auth, evaluations, lessons, materials, practice, tutor
from app.core.config import Settings, load_settings
from app.core.security import LoginLimiter
from app.services.repository import RepositoryUnavailable, build_repository
from app.services.tutor import TutorLimiter

log = logging.getLogger("kubus-balok")

_FIELD_NAMES = {"code": "Kode siswa", "pin": "PIN", "answers": "Jawaban", "level": "Level", "question": "Pertanyaan"}


def _validation_message(exc: RequestValidationError) -> str:
    err = exc.errors()[0] if exc.errors() else {}
    msg = str(err.get("msg", "Data yang dikirim tidak valid."))
    if msg.startswith("Value error, "):
        return msg.removeprefix("Value error, ")
    loc = [p for p in err.get("loc", []) if isinstance(p, str) and p != "body"]
    field = _FIELD_NAMES.get(loc[-1], loc[-1]) if loc else "Data"
    if err.get("type") == "missing":
        return f"{field} wajib diisi."
    if err.get("type") == "uuid_parsing":
        return "Data tidak ditemukan."
    return f"{field} tidak valid."


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    settings.validate()

    app = FastAPI(title="Belajar Kubus dan Balok API", version="1.0.0")
    app.state.settings = settings
    app.state.repo = build_repository(settings)
    app.state.login_limiter = LoginLimiter(settings.login_max_failures, settings.login_lock_seconds)
    app.state.tutor_limiter = TutorLimiter(settings.tutor_max_requests, 600)
    app.state.claude_tutor = None
    if settings.anthropic_api_key:
        from app.services.tutor.claude_provider import ClaudeTutor

        app.state.claude_tutor = ClaudeTutor(settings.anthropic_api_key, settings.tutor_model)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        status = 404 if any(e.get("type") == "uuid_parsing" for e in exc.errors()) else 422
        return JSONResponse({"detail": _validation_message(exc)}, status_code=status)

    @app.exception_handler(RepositoryUnavailable)
    async def _unavailable(_: Request, exc: RepositoryUnavailable):
        log.error("Database tidak tersedia: %s", exc)
        return JSONResponse({"detail": "Database sedang tidak dapat dihubungi. Coba lagi sebentar."},
                            status_code=503)

    @app.exception_handler(Exception)
    async def _unexpected(_: Request, exc: Exception):
        log.exception("Galat tak terduga: %s", exc)
        return JSONResponse({"detail": "Terjadi galat di server. Coba lagi."}, status_code=500)

    @app.get("/api/health", tags=["health"])
    def health():
        return {"status": "ok", "storage": settings.storage_mode,
                "tutor": "claude" if app.state.claude_tutor else "curated",
                "time": datetime.now(timezone.utc).isoformat()}

    @app.get("/", include_in_schema=False)
    def root():
        return {"app": "Belajar Kubus dan Balok API", "docs": "/docs"}

    for r in (auth.router, materials.router, lessons.router, tutor.router, evaluations.router, practice.router, attempts.router):
        app.include_router(r)

    log.info("Mode penyimpanan: %s", settings.storage_mode)
    return app


app = create_app()
