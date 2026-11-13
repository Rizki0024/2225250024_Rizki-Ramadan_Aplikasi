"""Menambah atau memperbarui akun siswa di Supabase.

Pemakaian (dari folder backend):
    python scripts/add_student.py KB-004 4567 "Kenari" --class VIII-A
Jika kode sudah ada, PIN dan nama samaran diperbarui.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402

from app.core.config import load_settings  # noqa: E402
from app.core.security import hash_pin  # noqa: E402
from app.models.constants import CODE_PATTERN, PIN_PATTERN  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(description="Tambah/perbarui akun siswa")
    p.add_argument("code")
    p.add_argument("pin")
    p.add_argument("nickname")
    p.add_argument("--class", dest="class_name", default=None)
    a = p.parse_args()

    code = a.code.strip().upper()
    if not re.match(CODE_PATTERN, code):
        print("Kode tidak valid (huruf besar, angka, '-', 3–20 karakter).")
        return 1
    if not re.match(PIN_PATTERN, a.pin):
        print("PIN harus 4–6 angka.")
        return 1

    s = load_settings()
    if s.storage_mode != "supabase":
        print("SUPABASE_URL dan SUPABASE_SECRET_KEY belum diisi di backend/.env")
        return 1
    headers = {"apikey": s.supabase_secret_key, "Content-Type": "application/json",
               "Prefer": "resolution=merge-duplicates,return=minimal"}
    if s.supabase_secret_key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {s.supabase_secret_key}"
    row = {"code": code, "pin_hash": hash_pin(a.pin), "nickname": a.nickname.strip(),
           "class_name": a.class_name, "is_active": True}
    r = httpx.post(f"{s.supabase_url}/rest/v1/students", params={"on_conflict": "code"},
                   json=row, headers=headers, timeout=30)
    if r.status_code >= 300:
        print(f"Gagal: {r.status_code} {r.text}")
        return 1
    print(f"OK  siswa {code} ({a.nickname}) tersimpan.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
