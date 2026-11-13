from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings
from app.core.security import decode_token
from app.services.repository import Repository

_bearer = HTTPBearer(auto_error=False)


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_repo(request: Request) -> Repository:
    return request.app.state.repo


def get_current_student(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
    repo: Repository = Depends(get_repo),
) -> dict:
    """Mengambil siswa dari token. Semua data siswa difilter dengan id dari sini."""
    unauthorized = HTTPException(401, "Sesi berakhir. Silakan masuk lagi.",
                                 headers={"WWW-Authenticate": "Bearer"})
    if creds is None:
        raise unauthorized
    payload = decode_token(creds.credentials, settings.jwt_secret)
    if not payload:
        raise unauthorized
    student = repo.get_student(payload["sub"])
    if not student or not student.get("is_active", True):
        raise unauthorized
    return student
