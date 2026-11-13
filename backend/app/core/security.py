"""Hash PIN (bcrypt), token JWT, dan pembatas percobaan login."""
from __future__ import annotations

import threading
import time
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

ALGORITHM = "HS256"
# Hash tiruan agar waktu respons sama ketika kode siswa tidak ditemukan.
_DUMMY_HASH = bcrypt.hashpw(b"0000", bcrypt.gensalt(rounds=10)).decode()


def hash_pin(pin: str, rounds: int = 12) -> str:
    return bcrypt.hashpw(pin.encode(), bcrypt.gensalt(rounds=rounds)).decode()


def verify_pin(pin: str, pin_hash: str | None) -> bool:
    target = pin_hash or _DUMMY_HASH
    try:
        ok = bcrypt.checkpw(pin.encode(), target.encode())
    except ValueError:  # hash rusak / bukan bcrypt
        return False
    return ok and pin_hash is not None


def create_token(student_id: str, code: str, secret: str, ttl_hours: int) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=ttl_hours)
    payload = {"sub": student_id, "code": code, "typ": "student", "iat": now, "exp": exp}
    return jwt.encode(payload, secret, algorithm=ALGORITHM), exp


def decode_token(token: str, secret: str) -> dict | None:
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM], options={"require": ["sub", "exp"]})
    except jwt.PyJWTError:
        return None
    if payload.get("typ") != "student":
        return None
    return payload


class LoginLimiter:
    """Mengunci pasangan (kode, IP) setelah terlalu banyak kegagalan. Disimpan di memori."""

    def __init__(self, max_failures: int, lock_seconds: int) -> None:
        self.max_failures = max_failures
        self.lock_seconds = lock_seconds
        self._failures: dict[tuple[str, str], list[float]] = {}
        self._lock = threading.Lock()

    def _recent(self, key: tuple[str, str], now: float) -> list[float]:
        items = [t for t in self._failures.get(key, []) if now - t < self.lock_seconds]
        self._failures[key] = items
        return items

    def is_locked(self, code: str, ip: str) -> bool:
        with self._lock:
            return len(self._recent((code, ip), time.monotonic())) >= self.max_failures

    def record_failure(self, code: str, ip: str) -> None:
        with self._lock:
            now = time.monotonic()
            self._recent((code, ip), now).append(now)

    def reset(self, code: str, ip: str) -> None:
        with self._lock:
            self._failures.pop((code, ip), None)
