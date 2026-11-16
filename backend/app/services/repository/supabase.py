"""Penyimpanan Supabase melalui REST (PostgREST) memakai secret key — hanya di server."""
from __future__ import annotations

import threading
import time
from datetime import datetime, timezone

import httpx

from .base import Repository, RepositoryUnavailable

_CACHE_SECONDS = 300


class SupabaseRepository(Repository):
    mode = "supabase"

    def __init__(self, url: str, secret_key: str, timeout: float = 10.0) -> None:
        headers = {"apikey": secret_key, "Content-Type": "application/json"}
        # Kunci lama (service_role) berupa JWT dan dikirim juga sebagai Bearer.
        # Secret key baru (sb_secret_...) cukup di header apikey.
        if secret_key.startswith("eyJ"):
            headers["Authorization"] = f"Bearer {secret_key}"
        self._client = httpx.Client(base_url=f"{url}/rest/v1", headers=headers, timeout=timeout)
        self._cache: dict[str, tuple[float, object]] = {}
        self._cache_lock = threading.Lock()

    # --- utilitas ---
    def _request(self, method: str, path: str, *, params=None, json=None, prefer: str | None = None):
        headers = {"Prefer": prefer} if prefer else None
        try:
            resp = self._client.request(method, path, params=params, json=json, headers=headers)
        except httpx.HTTPError as exc:
            raise RepositoryUnavailable(str(exc)) from exc
        if resp.status_code >= 500 or resp.status_code in (401, 403):
            raise RepositoryUnavailable(f"Supabase {resp.status_code}: {resp.text[:200]}")
        if resp.status_code >= 400:
            raise RuntimeError(f"Supabase {resp.status_code}: {resp.text[:300]}")
        return resp.json() if resp.content else None

    def _cached(self, key: str, loader):
        with self._cache_lock:
            hit = self._cache.get(key)
            if hit and time.monotonic() - hit[0] < _CACHE_SECONDS:
                return hit[1]
        value = loader()
        with self._cache_lock:
            self._cache[key] = (time.monotonic(), value)
        return value

    @staticmethod
    def _first(rows):
        return rows[0] if rows else None

    # --- siswa ---
    def get_student_by_code(self, code):
        return self._first(self._request("GET", "/students", params={
            "select": "*", "code": f"eq.{code}", "is_active": "is.true", "limit": "1"}))

    def get_student(self, student_id):
        return self._first(self._request("GET", "/students", params={
            "select": "id,code,nickname,class_name,is_active", "id": f"eq.{student_id}", "limit": "1"}))

    def touch_login(self, student_id):
        self._request("PATCH", "/students", params={"id": f"eq.{student_id}"},
                      json={"last_login_at": datetime.now(timezone.utc).isoformat()})

    # --- konten (di-cache 5 menit) ---
    def list_materials(self):
        return self._cached("materials", lambda: self._request("GET", "/materials", params={
            "select": "*", "is_published": "is.true", "order": "order_no.asc"}))

    def get_material(self, slug):
        return next((m for m in self.list_materials() if m["slug"] == slug), None)

    def list_evaluation_questions(self):
        return self._cached("questions", lambda: self._request("GET", "/questions", params={
            "select": "*", "is_active": "is.true", "usage": "eq.evaluasi", "order": "code.asc"}))

    def list_all_questions(self):
        return self._cached("questions_all", lambda: self._request("GET", "/questions", params={
            "select": "*", "order": "code.asc"}))

    # --- attempt ---
    def create_attempt(self, data):
        return self._first(self._request("POST", "/quiz_attempts", json=data, prefer="return=representation"))

    def get_attempt(self, attempt_id, student_id):
        return self._first(self._request("GET", "/quiz_attempts", params={
            "select": "*", "id": f"eq.{attempt_id}", "student_id": f"eq.{student_id}", "limit": "1"}))

    def find_open_evaluation(self, student_id):
        return self._first(self._request("GET", "/quiz_attempts", params={
            "select": "*", "student_id": f"eq.{student_id}", "mode": "eq.evaluasi",
            "status": "eq.in_progress", "order": "started_at.desc", "limit": "1"}))

    def update_attempt(self, attempt_id, data, only_if_status=None):
        params = {"id": f"eq.{attempt_id}"}
        if only_if_status:
            params["status"] = f"in.({','.join(only_if_status)})"
        return self._first(self._request("PATCH", "/quiz_attempts", params=params, json=data,
                                         prefer="return=representation"))

    def list_attempts(self, student_id):
        return self._request("GET", "/quiz_attempts", params={
            "select": "id,mode,level,status,score,correct_count,wrong_count,total_questions,stars,"
                      "duration_seconds,started_at,submitted_at,timed_out",
            "student_id": f"eq.{student_id}", "status": "eq.submitted",
            "order": "started_at.desc", "limit": "100"})

    # --- jawaban ---
    def insert_answers(self, rows):
        if rows:
            self._request("POST", "/quiz_answers", json=rows, prefer="return=minimal")

    def list_answers(self, attempt_id):
        return self._request("GET", "/quiz_answers", params={
            "select": "*", "attempt_id": f"eq.{attempt_id}", "order": "position.asc"})
