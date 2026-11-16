"""Penilaian soal bertahap (kisi-kisi Mathematical Literacy).

Setiap tahap punya skor sendiri (lihat docs/question-blueprint.md). Pedoman penskoran dari kisi-kisi:
- skor diberikan per tahap berdasarkan proses, bukan hanya jawaban akhir;
- skor parsial tetap diberikan bila tahapan berpikir benar tetapi ada salah hitung di tahap sebelumnya
  ("carry-forward": tahap berikutnya dinilai konsisten dengan angka siswa sendiri).
"""
from __future__ import annotations

import json

from .numbers import parse_number

TOL = 1e-6


def parse_parts(answer: str | dict | None) -> dict[str, str]:
    """Jawaban bertahap disimpan sebagai JSON {input_id: nilai}."""
    if not answer:
        return {}
    if isinstance(answer, dict):
        data = answer
    else:
        try:
            data = json.loads(answer)
        except (TypeError, ValueError):
            return {}
    if not isinstance(data, dict):
        return {}
    return {str(k): str(v).strip() for k, v in data.items() if v is not None and str(v).strip() != ""}


def _num(parts: dict[str, str], key: str) -> float | None:
    return parse_number(parts[key]) if key in parts else None


def _carry_value(rule: dict, parts: dict[str, str]) -> float | None:
    """Nilai yang konsisten dengan jawaban siswa di tahap sebelumnya (None bila tidak dapat dihitung)."""
    vals = [_num(parts, k) for k in rule.get("of", [])]
    if not vals or any(v is None for v in vals):
        return None
    op = rule["op"]
    if op == "mul":
        out = 1.0
        for v in vals:
            out *= v
        return out
    if op == "sum":
        return sum(vals)
    if op == "twice":
        return 2 * vals[0]
    if op == "twice_sum":
        return 2 * sum(vals)
    return None


def _choice_consistent(rule: dict, choice: str, parts: dict[str, str]) -> bool:
    """Pilihan konsisten dengan angka siswa sendiri (urutan / nilai terkecil)."""
    op = rule["op"]
    mapping = rule["map"]
    if op == "argmin":
        nums = {opt: _num(parts, inp) for opt, inp in mapping.items()}
        if any(v is None for v in nums.values()):
            return False
        smallest = min(nums.values())
        winners = [opt for opt, v in nums.items() if abs(v - smallest) <= TOL]
        return len(winners) == 1 and winners[0] == choice
    if op == "order":
        seq = mapping.get(choice)
        if not seq:
            return False
        vals = [_num(parts, k) for k in seq]
        if any(v is None for v in vals):
            return False
        return all(vals[i] < vals[i + 1] for i in range(len(vals) - 1))
    return False


def _input_correct(inp: dict, stage: dict, parts: dict[str, str]) -> bool:
    iid = inp["id"]
    given = parts.get(iid)
    if given is None:
        return False
    key = stage["key"][iid]
    carry = (stage.get("carry") or {}).get(iid)
    if inp["kind"] == "choice":
        if given.upper() == str(key).upper():
            return True
        return bool(carry) and _choice_consistent(carry, given.upper(), parts)
    value = parse_number(given)
    if value is None:
        return False
    if abs(value - float(key)) <= TOL:
        return True
    if carry:
        expected = _carry_value(carry, parts)
        return expected is not None and abs(value - expected) <= TOL
    return False


def grade(question: dict, answer: str | dict | None) -> dict:
    """Mengembalikan {points, max_points, stages: [{id, points, max_points, correct_inputs, total_inputs}]}."""
    parts = parse_parts(answer)
    stages_out = []
    total = 0
    for stage in question["stages"]:
        inputs = stage["inputs"]
        correct = sum(_input_correct(inp, stage, parts) for inp in inputs)
        if correct == len(inputs):
            pts = stage["points"]
        else:
            pts = int((stage.get("partial") or {}).get(str(correct), 0))
        pts = min(pts, stage["points"])
        total += pts
        stages_out.append({"id": stage["id"], "points": pts, "max_points": stage["points"],
                           "correct_inputs": correct, "total_inputs": len(inputs)})
    max_points = sum(s["points"] for s in question["stages"])
    return {"points": total, "max_points": max_points, "stages": stages_out}


def public_stages(question: dict) -> list[dict]:
    """Tahap untuk siswa saat mengerjakan — TANPA kunci, carry, dan pembahasan."""
    return [{"id": s["id"], "title": s["title"], "points": s["points"],
             "inputs": [{k: v for k, v in inp.items() if k in ("id", "kind", "label", "options", "unit")} for inp in s["inputs"]]}
            for s in question["stages"]]


def review_stages(question: dict, answer: str | dict | None, result: dict | None = None) -> list[dict]:
    """Tahap untuk pembahasan setelah dikumpulkan: jawaban siswa, kunci, skor, dan penjelasan."""
    parts = parse_parts(answer)
    result = result or grade(question, parts)
    by_id = {s["id"]: s for s in result["stages"]}
    out = []
    for s in question["stages"]:
        inputs = []
        for inp in s["inputs"]:
            key = s["key"][inp["id"]]
            label = key
            if inp["kind"] == "choice":
                label = next((o["label"] for o in inp["options"] if o["id"] == key), key)
            inputs.append({"id": inp["id"], "kind": inp["kind"], "label": inp["label"], "unit": inp.get("unit"),
                           "options": inp.get("options"), "student_answer": parts.get(inp["id"]),
                           "correct_answer": str(key), "correct_label": str(label),
                           "is_correct": _input_correct(inp, s, parts)})
        r = by_id.get(s["id"], {})
        out.append({"id": s["id"], "title": s["title"], "points": r.get("points", 0), "max_points": s["points"],
                    "inputs": inputs, "explanation": s.get("explanation")})
    return out
