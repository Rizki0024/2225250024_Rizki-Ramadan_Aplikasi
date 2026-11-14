"""Mesin tutor "curated": menjawab dari bank tanya-jawab (data/tutor_kb.json) dan naskah pelajaran.

Deterministik, gratis, dan tidak mengarang. Urutan:
1. Perhitungan terpandu (kubus 1 angka, balok 3 angka, aritmetika sederhana).
2. Permintaan khusus: ulangi, contoh, bingung (memakai naskah segmen yang sedang dibahas).
3. Intent bank tanya-jawab (dengan bonus konteks segmen).
4. Belum dikenali / di luar topik.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from functools import lru_cache

from app.core.config import DATA_DIR
from app.services.numbers import format_number, parse_number

NUMBER_WORDS = {
    "nol": "0", "satu": "1", "dua": "2", "tiga": "3", "empat": "4", "lima": "5", "enam": "6",
    "tujuh": "7", "delapan": "8", "sembilan": "9", "sepuluh": "10", "dua belas": "12",
}

FOLLOW_UP = "Apakah sekarang sudah lebih jelas?"


@dataclass
class TutorReply:
    answer: str
    intent: str | None
    in_scope: bool
    can_simplify: bool
    follow_up: str | None = FOLLOW_UP
    confidence: float = 1.0


@lru_cache
def load_kb() -> dict:
    with open(DATA_DIR / "tutor_kb.json", encoding="utf-8") as f:
        return json.load(f)


def normalize(text: str) -> str:
    t = text.lower()
    t = t.replace("×", " kali ").replace("*", " kali ").replace("²", "2").replace("³", "3")
    t = re.sub(r"(?<=\d)\s*x\s*(?=\d)", " kali ", t)
    t = re.sub(r"(?<=\d),(?=\d)", "#", t)  # lindungi koma desimal
    t = re.sub(r"[^\w#\s]", " ", t)
    t = t.replace("#", ",")
    t = re.sub(r"\bbu sari\b|\bbu\b|\bbuk\b|\bibu\b", " ", t)
    for word, digit in sorted(NUMBER_WORDS.items(), key=lambda kv: -len(kv[0])):
        t = re.sub(rf"\b{word}\b", digit, t)
    return re.sub(r"\s+", " ", t).strip()


def _has(text: str, alternatives: list[str]) -> bool:
    padded = f" {text} "
    return any(f" {alt} " in padded for alt in alternatives)


def _numbers(text: str) -> list[float]:
    out = []
    for raw in re.findall(r"\d+(?:[.,]\d+)*", text):
        v = parse_number(raw)
        if v is not None:
            out.append(v)
    return out


def _unit(text: str) -> str:
    return "m" if _has(text, ["m", "meter"]) else "cm"


# ---------- 1. perhitungan terpandu ----------
def _guided_calc(text: str, simpler: bool, intent: str | None) -> TutorReply | None:
    if intent and intent.startswith("calc-"):
        # permintaan "jelaskan lebih sederhana" untuk perhitungan sebelumnya → tampilkan hasil akhir
        kind, *vals = intent.split(":")
        nums = [float(v) for v in vals]
        return _calc_reply(kind, nums, "cm" if not kind.endswith("-m") else "m", reveal=True)
    nums = _numbers(text)
    m = re.fullmatch(r"(?:berapa |hitung |hitungkan )?(\d+(?:[.,]\d+)?) (kali|tambah|kurang|bagi|dibagi) (\d+(?:[.,]\d+)?)(?: berapa)?", text)
    if m:
        a, op, b = parse_number(m.group(1)), m.group(2), parse_number(m.group(3))
        if op in ("bagi", "dibagi") and b == 0:
            return TutorReply("Pembagian dengan nol tidak bisa dilakukan.", "calc-arith", True, False, None)
        res = {"kali": a * b, "tambah": a + b, "kurang": a - b}.get(op, a / b if b else 0)
        sym = {"kali": "×", "tambah": "+", "kurang": "−", "bagi": ":", "dibagi": ":"}[op]
        return TutorReply(f"{format_number(a)} {sym} {format_number(b)} = {format_number(round(res, 4))}.",
                          "calc-arith", True, False, None)
    asks = _has(text, ["luas", "berapa", "hitung", "menghitung", "hitungkan", "cari"])
    if not asks:
        return None
    unit = _unit(text)
    if _has(text, ["kubus"]) and len(nums) == 1 and nums[0] > 0:
        return _calc_reply("calc-kubus" + ("-m" if unit == "m" else ""), nums, unit, reveal=simpler)
    if _has(text, ["balok"]) and len(nums) == 3 and all(n > 0 for n in nums):
        return _calc_reply("calc-balok" + ("-m" if unit == "m" else ""), nums, unit, reveal=simpler)
    return None


def _calc_reply(kind: str, nums: list[float], unit: str, reveal: bool) -> TutorReply:
    f = format_number
    key = kind + ":" + ":".join(f"{n:g}" for n in nums)
    if kind.startswith("calc-kubus"):
        s = nums[0]
        face = s * s
        total = 6 * face
        steps = (f"Kita hitung bersama. Rusuknya s = {f(s)} {unit}. Luas satu sisi = {f(s)} × {f(s)} = {f(face)} {unit}². "
                 f"Kubus punya 6 sisi, jadi langkah terakhir adalah 6 × {f(face)}.")
        if reveal:
            return TutorReply(f"{steps} Hasilnya 6 × {f(face)} = {f(total)}. Jadi luas permukaannya {f(total)} {unit}².",
                              key, True, False)
        return TutorReply(f"{steps} Coba kamu hitung, berapa hasilnya? Kalau ingin mengecek, minta Bu Sari menjelaskan lebih sederhana.",
                          key, True, True, "Sudah bisa menghitung langkah terakhirnya?")
    p, l, t = nums
    a, b, c = p * l, p * t, l * t
    s = a + b + c
    steps = (f"Kita hitung bersama. p × l = {f(p)} × {f(l)} = {f(a)}, p × t = {f(p)} × {f(t)} = {f(b)}, "
             f"l × t = {f(l)} × {f(t)} = {f(c)}. Jumlahnya {f(a)} + {f(b)} + {f(c)} = {f(s)}. "
             f"Langkah terakhir adalah 2 × {f(s)}.")
    if reveal:
        return TutorReply(f"{steps} Hasilnya 2 × {f(s)} = {f(2 * s)}. Jadi luas permukaannya {f(2 * s)} {unit}².",
                          key, True, False)
    return TutorReply(f"{steps} Coba kamu hitung, berapa hasilnya? Kalau ingin mengecek, minta Bu Sari menjelaskan lebih sederhana.",
                      key, True, True, "Sudah bisa menghitung langkah terakhirnya?")


# ---------- 2. permintaan khusus ----------
def _segment_text(segment: dict | None, limit: int = 3) -> str:
    if not segment:
        return ""
    return " ".join(line["say"] for line in segment["script"][:limit])


def _special(text: str, segment: dict | None) -> TutorReply | None:
    special = load_kb()["special"]
    if not segment:
        return None
    if any(_has(text, alts) for alts in special["repeat"]):
        return TutorReply(f"Baik, Bu Sari ulangi pelan-pelan. {_segment_text(segment, 4)}", "repeat", True, True)
    if any(_has(text, alts) for alts in special["example"]):
        lines = [b["text"] for b in segment["board"] if b["type"] in ("line", "formula")]
        if lines:
            return TutorReply("Ini contohnya dari papan tulis: " + "; ".join(lines) + ".", "example", True, True)
    return None


def _confused(text: str, segment: dict | None) -> TutorReply | None:
    if segment and any(_has(text, alts) for alts in load_kb()["special"]["confused"]):
        return TutorReply(f"Tidak apa-apa, bingung itu wajar. Kita fokus pada satu hal dulu: {segment['goal']} "
                          f"{_segment_text(segment, 2)}", "confused", True, True)
    return None


# ---------- 3. bank tanya-jawab ----------
def _match_intent(text: str, concept: str | None) -> tuple[dict, float] | None:
    best, best_key = None, None
    for intent in load_kb()["intents"]:
        matched = sum(1 for alts in intent["terms"] if _has(text, alts))
        if matched == 0:
            continue
        ratio = matched / len(intent["terms"])
        boost = (0.25 if concept and concept in intent["concepts"] else 0.0) + intent.get("priority", 0.0)
        # Cocok sebagian hanya untuk intent ≥ 3 kelompok kata, minimal 2 cocok, dan relevan dengan segmen.
        # (Mencegah jawaban tak relevan karena satu kata umum seperti "kubus".)
        if ratio < 1.0 and not (len(intent["terms"]) >= 3 and matched >= 2 and boost):
            continue
        key = (ratio + boost, matched)
        if best_key is None or key > best_key:
            best, best_key = intent, key
    if best is None:
        return None
    return best, min(1.0, best_key[0])


def _intent_by_id(intent_id: str) -> dict | None:
    return next((i for i in load_kb()["intents"] if i["id"] == intent_id), None)


def answer(question: str, segment: dict | None, *, simpler: bool = False, intent: str | None = None) -> TutorReply:
    text = normalize(question)

    if simpler and intent:
        if intent.startswith("calc-"):
            return _guided_calc(text, True, intent)
        found = _intent_by_id(intent)
        if found:
            return TutorReply(found["simpler"], found["id"], True, False)
        if intent in ("repeat", "example", "confused") and segment:
            return TutorReply(f"Coba kita lihat dari sisi lain. {segment['goal']} Perhatikan papan tulis: "
                              + "; ".join(b["text"] for b in segment["board"] if b.get("text")) + ".",
                              intent, True, False)

    calc = _guided_calc(text, simpler, None)
    if calc:
        return calc
    special = _special(text, segment)
    if special:
        return special
    concept = segment["concept"] if segment else None
    hit = _match_intent(text, concept)
    if hit:
        found, conf = hit
        follow = None if found["id"] in ("terima-kasih", "sapaan") else FOLLOW_UP
        return TutorReply(found["answer"], found["id"], True, bool(found.get("simpler")) and follow is not None, follow, conf)
    confused = _confused(text, segment)
    if confused:
        return confused

    if any(_has(text, [w]) for w in load_kb()["math_words"]):
        return TutorReply("Bu Sari belum yakin dengan maksud pertanyaanmu. Coba tanyakan dengan kata lain, "
                          "misalnya \"kenapa dikali 6?\" atau \"apa bedanya luas dan volume?\"",
                          None, True, False, None, 0.0)
    return TutorReply("Pertanyaan itu di luar materi luas permukaan kubus dan balok, jadi Bu Sari tidak bisa menjawabnya di sini. "
                      "Kamu bisa menanyakannya kepada guru di kelas. Mau kita lanjutkan materinya?",
                      None, False, False, None, 0.0)
