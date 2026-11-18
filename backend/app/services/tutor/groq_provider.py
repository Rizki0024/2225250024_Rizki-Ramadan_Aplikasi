"""Mesin tutor gratis berbasis Groq (API kompatibel OpenAI). Aktif hanya jika GROQ_API_KEY diisi di backend.

Hemat kuota gratis (contoh paket gratis: ±30 permintaan/menit dan ±8.000 token/menit per model):
- system prompt ringkas: aturan RMT + materi pelajaran yang sedang dibuka saja (bukan seluruh materi);
- penalaran model gpt-oss diatur rendah dan tidak dikirim balik;
- beberapa model berurutan: bila satu model kena batas (HTTP 429) atau gangguan, coba model berikutnya;
  model yang kena batas diistirahatkan sesuai header `retry-after`.
Kunci API tidak pernah dikirim ke browser.
"""
from __future__ import annotations

import logging
import threading
import time

import httpx

from .prompting import RULES, clean_answer, conversation, course_reference

log = logging.getLogger("kubus-balok.tutor")

API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODELS = ("openai/gpt-oss-120b", "llama-3.3-70b-versatile", "openai/gpt-oss-20b")


class GroqUnavailable(Exception):
    """Semua model Groq sedang kena batas atau gangguan."""


class GroqTutor:
    name = "groq"

    def __init__(self, api_key: str, models: list[str] | tuple[str, ...] = DEFAULT_MODELS, client: httpx.Client | None = None,
                 clock=time.monotonic) -> None:
        self.models = [m for m in models if m] or list(DEFAULT_MODELS)
        self.client = client or httpx.Client(timeout=20.0, headers={"Authorization": f"Bearer {api_key}"})
        self._clock = clock
        self._resting: dict[str, float] = {}  # model → waktu boleh dipakai lagi
        self._lock = threading.Lock()

    def _available(self) -> list[str]:
        now = self._clock()
        with self._lock:
            return [m for m in self.models if self._resting.get(m, 0) <= now]

    def _rest(self, model: str, seconds: float) -> None:
        with self._lock:
            self._resting[model] = self._clock() + max(1.0, min(seconds, 3600.0))

    def _body(self, model: str, messages: list[dict]) -> dict:
        body = {"model": model, "messages": messages, "temperature": 0.6, "max_completion_tokens": 900}
        if model.startswith("openai/gpt-oss"):
            body.update(reasoning_effort="low", include_reasoning=False)
        return body

    def answer(self, question: str, segment: dict | None, history: list[dict], simpler: bool) -> tuple[str, bool] | None:
        system = RULES + "\nMateri pelajaran yang sedang dibuka (sumber utama jawaban):\n" + course_reference(
            segment["id"] if segment else None)
        messages = [{"role": "system", "content": system}, *conversation(question, segment, history, simpler, turns=6)]
        last_error = "tidak ada model tersedia"
        for model in self._available():
            try:
                r = self.client.post(API_URL, json=self._body(model, messages))
            except httpx.HTTPError as exc:
                last_error = f"{model}: {exc.__class__.__name__}"
                self._rest(model, 30)
                continue
            if r.status_code == 429:
                retry = r.headers.get("retry-after")
                self._rest(model, float(retry) if retry and retry.replace(".", "", 1).isdigit() else 60)
                last_error = f"{model}: batas kuota (429)"
                continue
            if r.status_code >= 500 or r.status_code in (404, 400):
                # 404/400: model dihentikan/berubah → istirahatkan lebih lama, coba model lain
                self._rest(model, 600 if r.status_code in (404, 400) else 30)
                last_error = f"{model}: HTTP {r.status_code}"
                continue
            if r.status_code >= 300:
                raise GroqUnavailable(f"{model}: HTTP {r.status_code}")
            try:
                choice = r.json()["choices"][0]
                text = choice["message"].get("content") or ""
            except (ValueError, KeyError, IndexError):
                last_error = f"{model}: respons tidak terbaca"
                continue
            result = clean_answer(text)
            if result:
                return result
            last_error = f"{model}: jawaban kosong"
        raise GroqUnavailable(last_error)
