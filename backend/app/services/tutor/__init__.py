"""Guru virtual: memilih mesin jawaban (curated → Claude opsional → cadangan curated)."""
from __future__ import annotations

import logging
import threading
import time

from . import curated
from .curated import FOLLOW_UP, TutorReply

log = logging.getLogger("kubus-balok.tutor")


def ask(question: str, segment: dict | None, history: list[dict], *, simpler: bool = False,
        intent: str | None = None, claude=None, providers: list | None = None) -> tuple[TutorReply, str]:
    """Mengembalikan (balasan, sumber) dengan sumber 'curated', 'claude', atau 'groq'.

    Bila ada AI aktif, semua pertanyaan dijawab AI agar alami dan mengikuti percakapan. Penyedia dicoba berurutan
    (Claude → Groq); jawaban siap pakai (curated) hanya cadangan saat semua AI gagal atau kuota habis.
    Perintah "ulangi" tetap memutar ulang penjelasan papan tulis.
    """
    chain = [p for p in ([claude] if claude is not None else []) + list(providers or []) if p is not None]
    reply = curated.answer(question, segment, simpler=simpler, intent=intent)
    if reply.intent != "repeat":
        for provider in chain:
            name = getattr(provider, "name", "claude")
            try:
                result = provider.answer(question, segment, history, simpler)
            except Exception as exc:  # layanan AI gagal / kuota habis → coba penyedia berikutnya
                log.warning("Tutor %s gagal: %s", name, exc)
                continue
            if result:
                text, in_scope = result
                return TutorReply(text, "ai", in_scope, in_scope, FOLLOW_UP if in_scope else None), name
    return _avoid_repeat(reply, question, segment, history), "curated"


def _avoid_repeat(reply: TutorReply, question: str, segment: dict | None, history: list[dict]) -> TutorReply:
    """Mode tanpa AI: jangan mengulang kalimat yang persis sama dengan jawaban sebelumnya."""
    previous = {t["text"].strip() for t in history if t.get("role") == "teacher"}
    if reply.answer.strip() not in previous:
        return reply
    simpler = curated.answer(question, segment, simpler=True, intent=reply.intent)
    if simpler.answer.strip() not in previous:
        return simpler
    goal = f" Tujuan bagian ini: {segment['goal']}" if segment else ""
    return TutorReply("Bu Sari sudah menjawab itu dengan cara yang sama. Coba sebutkan bagian mana yang belum jelas, "
                      "misalnya rumusnya, cara menghitung sisi, atau satuannya." + goal, "clarify", True, False, None, 0.3)


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
