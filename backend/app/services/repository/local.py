"""Penyimpanan lokal berbasis file JSON — untuk pengembangan & pengujian tanpa Supabase."""
from __future__ import annotations

import copy
import json
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.core.security import hash_pin
from app.services.content import load_demo_students, load_materials, load_questions

from .base import Repository


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class LocalRepository(Repository):
    mode = "local"

    def __init__(self, data_dir: Path) -> None:
        self.path = Path(data_dir) / "db.json"
        self._lock = threading.Lock()
        self._save_lock = threading.Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists():
            self._db = json.loads(self.path.read_text(encoding="utf-8"))
        else:
            self._db = {"students": [], "quiz_attempts": [], "quiz_answers": []}
            for s in load_demo_students():
                self._db["students"].append({
                    "id": str(uuid.uuid4()), "code": s["code"], "pin_hash": hash_pin(s["pin"], rounds=10),
                    "nickname": s["nickname"], "class_name": s.get("class_name"),
                    "is_active": True, "created_at": _now(), "last_login_at": None,
                })
            self._save()

    def _save(self) -> None:
        # Satu penulis pada satu waktu; file sementara unik; coba ulang bila Windows sesaat mengunci db.json
        # (antivirus/pengindeks) agar penyimpanan tidak gagal dengan PermissionError.
        with self._save_lock:
            data = json.dumps(self._db, ensure_ascii=False, indent=1)
            tmp = self.path.with_name(f"db.{os.getpid()}.{threading.get_ident()}.tmp")
            tmp.write_text(data, encoding="utf-8")
            for attempt in range(10):
                try:
                    tmp.replace(self.path)
                    return
                except PermissionError:
                    if attempt == 9:
                        tmp.unlink(missing_ok=True)
                        raise
                    time.sleep(0.05 * (attempt + 1))

    # --- siswa ---
    def get_student_by_code(self, code):
        return next((copy.deepcopy(s) for s in self._db["students"] if s["code"] == code and s["is_active"]), None)

    def get_student(self, student_id):
        return next((copy.deepcopy(s) for s in self._db["students"] if s["id"] == student_id), None)

    def touch_login(self, student_id):
        with self._lock:
            for s in self._db["students"]:
                if s["id"] == student_id:
                    s["last_login_at"] = _now()
            self._save()

    # --- konten ---
    def list_materials(self):
        return sorted((copy.deepcopy(m) for m in load_materials() if m["is_published"]), key=lambda m: m["order_no"])

    def get_material(self, slug):
        return next((copy.deepcopy(m) for m in load_materials() if m["slug"] == slug and m["is_published"]), None)

    def list_evaluation_questions(self):
        return [copy.deepcopy(q) for q in load_questions() if q["is_active"] and q["usage"] == "evaluasi"]

    def list_all_questions(self):
        return [copy.deepcopy(q) for q in load_questions()]

    # --- attempt ---
    def create_attempt(self, data):
        row = {
            "id": str(uuid.uuid4()), "status": "in_progress", "started_at": _now(), "expires_at": None,
            "submitted_at": None, "duration_seconds": None, "correct_count": None, "wrong_count": None,
            "score": None, "stars": None, "level": None, "question_order": [], "timed_out": False,
            **data,
        }
        with self._lock:
            self._db["quiz_attempts"].append(row)
            self._save()
        return copy.deepcopy(row)

    def get_attempt(self, attempt_id, student_id):
        return next((copy.deepcopy(a) for a in self._db["quiz_attempts"]
                     if a["id"] == attempt_id and a["student_id"] == student_id), None)

    def find_open_evaluation(self, student_id):
        rows = [a for a in self._db["quiz_attempts"]
                if a["student_id"] == student_id and a["mode"] == "evaluasi" and a["status"] == "in_progress"]
        rows.sort(key=lambda a: a["started_at"], reverse=True)
        return copy.deepcopy(rows[0]) if rows else None

    def update_attempt(self, attempt_id, data, only_if_status=None):
        with self._lock:
            for a in self._db["quiz_attempts"]:
                if a["id"] == attempt_id:
                    if only_if_status and a["status"] not in only_if_status:
                        return None
                    a.update(data)
                    self._save()
                    return copy.deepcopy(a)
        return None

    def list_attempts(self, student_id):
        rows = [copy.deepcopy(a) for a in self._db["quiz_attempts"]
                if a["student_id"] == student_id and a["status"] == "submitted"]
        return sorted(rows, key=lambda a: a["started_at"], reverse=True)

    # --- jawaban ---
    def insert_answers(self, rows):
        with self._lock:
            for r in rows:
                self._db["quiz_answers"].append({"id": str(uuid.uuid4()), "answered_at": _now(), **r})
            self._save()

    def list_answers(self, attempt_id):
        rows = [copy.deepcopy(a) for a in self._db["quiz_answers"] if a["attempt_id"] == attempt_id]
        return sorted(rows, key=lambda a: a["position"])
