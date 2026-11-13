from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.constants import CODE_PATTERN, PIN_PATTERN


class LoginRequest(BaseModel):
    code: str
    pin: str

    @field_validator("code")
    @classmethod
    def _code(cls, v: str) -> str:
        v = (v or "").strip().upper()
        if not v:
            raise ValueError("Kode siswa wajib diisi.")
        if not re.match(CODE_PATTERN, v):
            raise ValueError("Format kode siswa tidak valid. Contoh: KB-001.")
        return v

    @field_validator("pin")
    @classmethod
    def _pin(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("PIN wajib diisi.")
        if not re.match(PIN_PATTERN, v):
            raise ValueError("PIN harus 4–6 angka.")
        return v


class StudentOut(BaseModel):
    id: str
    code: str
    nickname: str
    class_name: str | None = None


class LoginResponse(BaseModel):
    token: str
    expires_at: datetime
    student: StudentOut
