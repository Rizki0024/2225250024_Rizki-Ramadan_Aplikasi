"""Mesin tutor opsional berbasis Claude (Anthropic API). Aktif hanya jika ANTHROPIC_API_KEY diisi di backend.

Kunci API tidak pernah dikirim ke browser. Jawaban dibatasi oleh system prompt pedagogis dan konteks materi proyek.
"""
from __future__ import annotations

import logging

from app.services.content import load_lessons

log = logging.getLogger("kubus-balok.tutor")

OUT_OF_SCOPE_TAG = "[DI-LUAR-MATERI]"

# Model yang mendukung parameter server-side `fallbacks` (lihat dokumentasi Claude API).
_FALLBACK_MODELS = {"claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5", "claude-fable-5-1", "claude-fable-5-2"}

RULES = f"""Kamu adalah Bu Sari, guru virtual matematika (program komputer, bukan manusia) untuk siswa SMP kelas VIII di Indonesia.
Topikmu HANYA luas permukaan kubus dan balok, beserta prasyaratnya (luas persegi dan persegi panjang) dan soal cerita terkait.

Aturan menjawab:
1. Pakai Bahasa Indonesia yang ramah, sederhana, dan mudah dipahami siswa SMP. Sapa siswa dengan "kamu".
2. Jawab singkat: paling banyak 4 kalimat pendek. Satu ide per kalimat.
3. Jelaskan bertahap dan pakai contoh konkret (kotak kado, kotak sepatu, akuarium, dadu).
4. Hubungkan gambar, rumus, dan perhitungan. Rumus yang benar: luas persegi s × s; luas persegi panjang p × l;
   luas permukaan kubus 6 × s × s; luas permukaan balok 2 × (p × l + p × t + l × t); tanpa tutup = kurangi satu sisi atas.
5. Jangan langsung memberi jawaban akhir soal hitungan. Bimbing langkahnya dan biarkan siswa menghitung langkah terakhir.
6. Jika siswa tampak salah konsep (misalnya tertukar dengan volume), jelaskan bedanya dengan lembut.
7. Untuk soal cerita, bantu siswa menentukan yang diketahui dan ditanyakan (Formulate), memakai rumus (Employ),
   dan menafsirkan hasil sesuai situasi (Interpret), misalnya membulatkan ke atas jumlah kaleng.
8. Jangan mengarang rumus atau fakta. Jika tidak yakin, katakan terus terang.
9. Jika pertanyaan di luar topik di atas, balas dengan awalan {OUT_OF_SCOPE_TAG} lalu satu kalimat yang mengarahkan siswa
   bertanya kepada guru di kelas. Jangan menjawab topik lain apa pun.
10. Tulis teks biasa tanpa markdown, tanpa daftar bernomor, dan tanpa emoji karena jawabanmu dibacakan dengan suara.
11. Jangan menutup jawaban dengan pertanyaan "sudah paham?"; aplikasi akan menanyakannya sendiri.
12. Jangan meminta atau menyimpan data pribadi siswa.
"""


def _course_reference() -> str:
    parts = []
    for lesson in load_lessons():
        parts.append(f"# Pelajaran: {lesson['title']}")
        for seg in lesson["segments"]:
            board = "; ".join(b.get("text", "") for b in seg["board"] if b.get("text"))
            parts.append(f"## {seg['id']} {seg['title']} — tujuan: {seg['goal']}\nPapan: {board}")
    return "\n".join(parts)


def build_system() -> list[dict]:
    """System prompt stabil (dapat di-cache): aturan + rangkuman seluruh materi."""
    return [{"type": "text", "text": RULES + "\nMateri resmi aplikasi (sumber utama jawaban):\n" + _course_reference(),
             "cache_control": {"type": "ephemeral"}}]


class ClaudeTutor:
    def __init__(self, api_key: str, model: str, client=None) -> None:
        if client is None:
            import anthropic  # impor di sini agar paket opsional tidak wajib di mode curated

            client = anthropic.Anthropic(api_key=api_key, timeout=20.0, max_retries=1)
        self.client = client
        self.model = model
        self.system = build_system()

    def answer(self, question: str, segment: dict | None, history: list[dict], simpler: bool) -> tuple[str, bool] | None:
        """Mengembalikan (jawaban, di_dalam_topik) atau None bila tidak ada jawaban yang dapat dipakai."""
        context = ""
        if segment:
            say = " ".join(line["say"] for line in segment["script"])
            context = f"Siswa sedang mempelajari segmen '{segment['title']}' (tujuan: {segment['goal']}). Naskah guru: {say}\n"
        mode = "Siswa belum paham. Jelaskan ulang dengan cara yang lebih sederhana dan contoh lain.\n" if simpler else ""
        messages = []
        for turn in history[-6:]:
            role = "user" if turn["role"] == "student" else "assistant"
            if messages and messages[-1]["role"] == role:
                messages[-1]["content"] += "\n" + turn["text"]
            else:
                messages.append({"role": role, "content": turn["text"]})
        if messages and messages[0]["role"] == "assistant":
            messages.insert(0, {"role": "user", "content": "(awal percakapan)"})
        user_text = f"{context}{mode}Pertanyaan siswa: {question}"
        if messages and messages[-1]["role"] == "user":
            messages[-1]["content"] += "\n" + user_text
        else:
            messages.append({"role": "user", "content": user_text})

        kwargs = dict(model=self.model, max_tokens=2048, system=self.system, messages=messages,
                      output_config={"effort": "low"})
        if self.model in _FALLBACK_MODELS:
            response = self.client.beta.messages.create(betas=["server-side-fallback-2026-07-01"], fallbacks="default", **kwargs)
        else:
            response = self.client.messages.create(**kwargs)

        if response.stop_reason == "refusal":
            log.warning("Claude menolak menjawab (kategori: %s)", getattr(response.stop_details, "category", None))
            return None
        text = "".join(b.text for b in response.content if b.type == "text").strip()
        if not text:
            return None
        if text.startswith(OUT_OF_SCOPE_TAG):
            return text[len(OUT_OF_SCOPE_TAG):].strip(), False
        return text, True
