"""Memuat konten sumber (materi & soal) dari backend/app/data/*.json."""
from __future__ import annotations

import json
import uuid
from functools import lru_cache

from app.core.config import DATA_DIR

# Namespace tetap agar id soal sama di mode lokal dan di Supabase (lihat scripts/seed_supabase.py).
QUESTION_NAMESPACE = uuid.UUID("6f1d3a52-8f43-4c1b-9d0e-6b2a8c1e7f10")


def question_id(code: str) -> str:
    return str(uuid.uuid5(QUESTION_NAMESPACE, code))


@lru_cache
def load_materials() -> list[dict]:
    with open(DATA_DIR / "materials.json", encoding="utf-8") as f:
        items = json.load(f)
    for m in items:
        m.setdefault("is_published", True)
    return items


@lru_cache
def load_questions() -> list[dict]:
    with open(DATA_DIR / "questions.json", encoding="utf-8") as f:
        items = json.load(f)
    for q in items:
        q["id"] = question_id(q["code"])
        q.setdefault("usage", "evaluasi")
        q.setdefault("is_active", True)
    return items


def load_demo_students() -> list[dict]:
    with open(DATA_DIR / "demo_students.json", encoding="utf-8") as f:
        return json.load(f)
