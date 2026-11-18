"""Bahan bersama untuk semua penyedia AI guru virtual: aturan pedagogis RMT, konteks materi, riwayat, dan pembersihan teks."""
from __future__ import annotations

import re

from app.services.content import load_lessons

OUT_OF_SCOPE_TAG = "[DI-LUAR-MATERI]"

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
    Pertanyaan tentang dirimu (misalnya "kamu manusia atau robot?") bukan di luar materi: jawab jujur tanpa awalan {OUT_OF_SCOPE_TAG},
    sebut dirimu "Bu Sari", lalu ajak kembali ke materi.
"""


def _lesson_lines(lesson: dict) -> list[str]:
    lines = [f"# Pelajaran: {lesson['title']}"]
    for seg in lesson["segments"]:
        board = "; ".join(b.get("text", "") for b in seg["board"] if b.get("text"))
        lines.append(f"## {seg['id']} {seg['title']} — tujuan: {seg['goal']}\nPapan: {board}")
    return lines


def course_reference(segment_id: str | None = None) -> str:
    """Rangkuman materi. Dengan segment_id: hanya pelajaran yang sedang dibuka (hemat token)."""
    lessons = load_lessons()
    if segment_id:
        own = [l for l in lessons if any(s["id"] == segment_id for s in l["segments"])]
        lessons = own or lessons
    return "\n".join(line for lesson in lessons for line in _lesson_lines(lesson))


def user_turn(question: str, segment: dict | None, simpler: bool) -> str:
    context = ""
    if segment:
        say = " ".join(line["say"] for line in segment["script"])
        context = f"Siswa sedang mempelajari segmen '{segment['title']}' (tujuan: {segment['goal']}). Naskah guru: {say}\n"
    mode = "Siswa belum paham. Jelaskan ulang dengan cara yang lebih sederhana dan contoh lain.\n" if simpler else ""
    return f"{context}{mode}Pertanyaan siswa: {question}"


def conversation(question: str, segment: dict | None, history: list[dict], simpler: bool, turns: int = 10) -> list[dict]:
    """Pesan bergantian user/assistant: riwayat terakhir + pertanyaan sekarang (diawali user)."""
    messages: list[dict] = []
    for turn in history[-turns:]:
        role = "user" if turn["role"] == "student" else "assistant"
        if messages and messages[-1]["role"] == role:
            messages[-1]["content"] += "\n" + turn["text"]
        else:
            messages.append({"role": role, "content": turn["text"]})
    if messages and messages[0]["role"] == "assistant":
        messages.insert(0, {"role": "user", "content": "(awal percakapan)"})
    text = user_turn(question, segment, simpler)
    if messages and messages[-1]["role"] == "user":
        messages[-1]["content"] += "\n" + text
    else:
        messages.append({"role": "user", "content": text})
    return messages


_MD = [
    (re.compile(r"\*\*(.+?)\*\*"), r"\1"), (re.compile(r"(?<!\w)\*(.+?)\*(?!\w)"), r"\1"),
    (re.compile(r"^\s{0,3}#{1,6}\s*", re.M), ""), (re.compile(r"^\s*[-•]\s+", re.M), ""),
    (re.compile(r"^\s*\d+[.)]\s+", re.M), ""), (re.compile(r"\\[()\[\]]"), ""), (re.compile(r"`+"), ""),
    (re.compile(r"\^2\b"), "²"), (re.compile(r"\\times"), "×"),
    (re.compile("[‐‑‒­]"), "-"), (re.compile("[  ]"), " "),
]


def clean_answer(text: str) -> tuple[str, bool] | None:
    """Bersihkan sisa markdown/LaTeX (jawaban dibacakan), lalu kenali tanda di luar materi."""
    text = (text or "").strip()
    for pattern, repl in _MD:
        text = pattern.sub(repl, text)
    text = re.sub(r"\s*\n\s*", " ", text).strip()
    if not text:
        return None
    if text.startswith(OUT_OF_SCOPE_TAG):
        rest = text[len(OUT_OF_SCOPE_TAG):].strip()
        return (rest or "Itu di luar materi kita. Yuk kembali ke luas permukaan kubus dan balok."), False
    return text, True
