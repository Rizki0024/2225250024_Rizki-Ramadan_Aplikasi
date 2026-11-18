"""Mesin tutor opsional berbasis Claude (Anthropic API). Aktif hanya jika ANTHROPIC_API_KEY diisi di backend.

Kunci API tidak pernah dikirim ke browser. Jawaban dibatasi oleh system prompt pedagogis dan konteks materi proyek.
"""
from __future__ import annotations

import logging

from .prompting import OUT_OF_SCOPE_TAG, RULES, clean_answer, conversation, course_reference  # noqa: F401

log = logging.getLogger("kubus-balok.tutor")

# Model yang mendukung parameter server-side `fallbacks` (lihat dokumentasi Claude API).
_FALLBACK_MODELS = {"claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5", "claude-fable-5-1", "claude-fable-5-2"}


def build_system() -> list[dict]:
    """System prompt stabil (dapat di-cache): aturan + rangkuman seluruh materi."""
    return [{"type": "text", "text": RULES + "\nMateri resmi aplikasi (sumber utama jawaban):\n" + course_reference(),
             "cache_control": {"type": "ephemeral"}}]


class ClaudeTutor:
    def __init__(self, api_key: str, model: str, client=None) -> None:
        if client is None:
            import anthropic  # impor di sini agar paket opsional tidak wajib di mode curated

            client = anthropic.Anthropic(api_key=api_key, timeout=20.0, max_retries=1)
        self.client = client
        self.model = model
        self.system = build_system()

    name = "claude"

    def answer(self, question: str, segment: dict | None, history: list[dict], simpler: bool) -> tuple[str, bool] | None:
        """Mengembalikan (jawaban, di_dalam_topik) atau None bila tidak ada jawaban yang dapat dipakai."""
        messages = conversation(question, segment, history, simpler)
        kwargs = dict(model=self.model, max_tokens=2048, system=self.system, messages=messages,
                      output_config={"effort": "low"})
        if self.model in _FALLBACK_MODELS:
            response = self.client.beta.messages.create(betas=["server-side-fallback-2026-07-01"], fallbacks="default", **kwargs)
        else:
            response = self.client.messages.create(**kwargs)

        if response.stop_reason == "refusal":
            log.warning("Claude menolak menjawab (kategori: %s)", getattr(response.stop_details, "category", None))
            return None
        return clean_answer("".join(b.text for b in response.content if b.type == "text"))
