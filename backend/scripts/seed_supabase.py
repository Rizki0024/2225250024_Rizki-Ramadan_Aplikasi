"""Mengisi/memperbarui tabel materials dan questions di Supabase dari app/data/*.json.

Pemakaian (dari folder backend, dengan SUPABASE_URL & SUPABASE_SECRET_KEY di backend/.env):
    python scripts/seed_supabase.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402

from app.core.config import load_settings  # noqa: E402
from app.services.content import load_materials, load_questions  # noqa: E402


def main() -> int:
    s = load_settings()
    if s.storage_mode != "supabase":
        print("SUPABASE_URL dan SUPABASE_SECRET_KEY belum diisi di backend/.env")
        return 1
    headers = {"apikey": s.supabase_secret_key, "Content-Type": "application/json",
               "Prefer": "resolution=merge-duplicates,return=minimal"}
    if s.supabase_secret_key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {s.supabase_secret_key}"

    materials = [{k: m[k] for k in ("slug", "title", "shape", "order_no", "summary", "content", "is_published")}
                 for m in load_materials()]
    questions = [{k: q[k] for k in ("id", "code", "usage", "process", "shape", "difficulty", "type", "prompt",
                                    "options", "answer_key", "unit", "tolerance", "explanation", "is_active")}
                 for q in load_questions()]

    with httpx.Client(base_url=f"{s.supabase_url}/rest/v1", headers=headers, timeout=30) as c:
        for table, rows, key in (("materials", materials, "slug"), ("questions", questions, "code")):
            r = c.post(f"/{table}", params={"on_conflict": key}, json=rows)
            if r.status_code >= 300:
                print(f"Gagal mengisi {table}: {r.status_code} {r.text}")
                return 1
            print(f"OK  {table}: {len(rows)} baris")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
