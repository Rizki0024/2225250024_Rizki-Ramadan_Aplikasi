from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.deps import get_current_student, get_repo, get_settings
from app.core.config import Settings
from app.core.security import create_token, verify_pin
from app.schemas.auth import LoginRequest, LoginResponse, StudentOut
from app.services.repository import Repository

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _student_out(s: dict) -> StudentOut:
    return StudentOut(id=s["id"], code=s["code"], nickname=s["nickname"], class_name=s.get("class_name"))


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, request: Request,
          settings: Settings = Depends(get_settings), repo: Repository = Depends(get_repo)):
    limiter = request.app.state.login_limiter
    ip = request.client.host if request.client else "?"
    if limiter.is_locked(body.code, ip):
        raise HTTPException(429, "Terlalu banyak percobaan. Coba lagi dalam 5 menit.")

    student = repo.get_student_by_code(body.code)
    if not verify_pin(body.pin, student["pin_hash"] if student else None):
        limiter.record_failure(body.code, ip)
        raise HTTPException(401, "Kode siswa atau PIN salah.")

    limiter.reset(body.code, ip)
    repo.touch_login(student["id"])
    token, exp = create_token(student["id"], student["code"], settings.jwt_secret, settings.token_ttl_hours)
    return LoginResponse(token=token, expires_at=exp, student=_student_out(student))


@router.get("/me", response_model=StudentOut)
def me(student: dict = Depends(get_current_student)):
    return _student_out(student)
