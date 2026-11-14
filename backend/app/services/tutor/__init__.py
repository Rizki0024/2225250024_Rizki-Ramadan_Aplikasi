"""Guru virtual: memilih mesin jawaban (curated → Claude opsional → cadangan curated)."""
from __future__ import annotations

import logging
import threading
import time

from . import curated
from .curated import FOLLOW_UP, TutorReply

log = logging.getLogger("kubus-balok.tutor")

# Jawaban curated dengan keyakinan setinggi ini dipakai langsung tanpa memanggil AI (hemat & konsisten).
CURATED_CONFIDENT = 0.75


def ask(question: str, segment: dict | None, history: list[dict], *, simpler: bool = False,
        intent: str | None = None, claude=None) -> tuple[TutorReply, str]:
    """Mengembalikan (balasan, sumber) dengan sumber 'curated' atau 'claude'."""
    reply = curated.answer(question, segment, simpler=simpler, intent=intent)
    deterministic = reply.intent is not None and (
        reply.intent.startswith("calc-") or reply.intent in ("repeat", "example", "sapaan", "terima-kasih"))
    if deterministic or (reply.intent and reply.confidence >= CURATED_CONFIDENT and intent != "ai"):
        return reply, "curated"
    if claude is not None:
        try:
            result = claude.answer(question, segment, history, simpler)
        except Exception as exc:  # layanan AI gagal → tetap menjawab dengan curated
            log.warning("Tutor Claude gagal, memakai curated: %s", exc)
            result = None
        if result:
            text, in_scope = result
            return TutorReply(text, "ai", in_scope, in_scope, FOLLOW_UP if in_scope else None), "claude"
    return reply, "curated"


class TutorLimiter:
    """Batas pertanyaan per siswa (memori proses) agar layanan tidak disalahgunakan dan biaya terkendali."""

    def __init__(self, max_requests: int = 30, window_seconds: int = 600) -> None:
        self.max = max_requests
        self.window = window_seconds
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            hits = [t for t in self._hits.get(key, []) if now - t < self.window]
            if len(hits) >= self.max:
                self._hits[key] = hits
                return False
            hits.append(now)
            self._hits[key] = hits
            return True
