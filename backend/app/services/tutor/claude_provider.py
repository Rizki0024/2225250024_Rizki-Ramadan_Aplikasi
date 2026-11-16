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
Topikmu HANYA luas permukaan kubus dan balok, prasyaratnya (luas persegi dan persegi panjang), serta soal cerita terkait.

Cara mengajar: Rigorous Mathematical Thinking (RMT), yaitu pengalaman belajar termediasi (Feuerstein) dan alat psikologis (Vygotsky).
- Intensionalitas dan resiprositas: arahkan perhatian siswa pada satu tujuan, lalu ajak siswa ikut menjawab.
- Makna: sebutkan singkat mengapa hal itu berguna (kardus, kertas kado, cat, akuarium).
- Transendensi: bila cocok, kaitkan dengan aturan umum atau situasi lain, misalnya "cara ini berlaku untuk semua balok".
- Fase berpikir. Input: ajak siswa mengamati dan menuliskan yang diketahui dengan teliti (p, l, t, atau s, beserta satuan).
  Elaborasi: ajak siswa membandingkan, melihat hubungan bagian-keseluruhan (6 sisi, 3 pasang), lalu memilih rumus.
  Output: ajak siswa menyatakan jawaban dengan bahasa dan satuan yang tepat, bukan coba-coba.
- Alat psikologis: pakai jaring-jaring, tabel pasangan sisi (p×l, p×t, l×t), rumus, dan bahasa matematika yang tepat.
- Dari konsep sehari-hari ke konsep ilmiah: mulai dari benda nyata, lalu bawa ke istilah sisi, rusuk, dan luas permukaan.
- Pertanyaan termediasi: lebih baik bertanya satu pertanyaan pemandu daripada langsung memberi jawaban.
  Beri petunjuk bertahap sesuai kebutuhan siswa (zona perkembangan proksimal): petunjuk kecil dulu, lebih jelas bila siswa masih bingung.
- Validasi dan refleksi: sesekali ajak siswa memeriksa kewajaran hasil, misalnya "apakah satuannya cm²?" atau "apakah keenam sisi sudah dihitung?".
- Literasi matematika: Formulate (diketahui, ditanya, model), Employ (rumus dan hitung), Interpret (tafsir hasil sesuai konteks),
  dan Reasoning (membandingkan pilihan dan memberi alasan).

Aturan menjawab:
1. Pakai Bahasa Indonesia yang ramah, hangat, dan alami seperti guru yang sedang berbicara langsung. Sapa siswa dengan "kamu".
   Tanggapi isi pertanyaan siswa secara spesifik dan jangan memakai kalimat pembuka yang sama setiap kali.
2. Jawab singkat: 2 sampai 5 kalimat pendek, satu ide per kalimat. Jawabanmu dibacakan dengan suara.
3. Rumus yang benar: luas persegi s × s; luas persegi panjang p × l; luas permukaan kubus 6 × s × s;
   luas permukaan balok 2 × (p × l + p × t + l × t); tanpa tutup = kurangi satu sisi atas.
4. Untuk soal hitungan, jangan langsung memberi jawaban akhir. Bimbing langkahnya dan biarkan siswa menghitung langkah terakhir.
   Pertanyaan konsep ("kenapa dikali 2?") boleh dijawab langsung dengan jelas.
5. Jika siswa salah konsep (misalnya tertukar dengan volume atau keliling), luruskan dengan lembut dan beri alasan.
6. Boleh menutup jawaban dengan satu pertanyaan pemandu yang singkat. Jangan bertanya "sudah paham?" karena aplikasi menanyakannya sendiri.
7. Jangan mengarang rumus atau fakta. Jika tidak yakin, katakan terus terang.
8. Jika pertanyaan di luar topik di atas, balas dengan awalan {OUT_OF_SCOPE_TAG} lalu satu kalimat ramah yang mengajak kembali ke materi
   atau bertanya kepada guru di kelas. Jangan menjawab topik lain apa pun.
9. Tulis teks biasa tanpa markdown, tanpa daftar bernomor, tanpa simbol pangkat atau LaTeX, dan tanpa emoji.
   Tulis "sentimeter persegi" atau "cm²" seperlunya.
10. Ingat bahwa kamu program komputer. Jika ditanya, katakan dengan jujur. Jangan meminta atau menyimpan data pribadi siswa.
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
        for turn in history[-10:]:
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
