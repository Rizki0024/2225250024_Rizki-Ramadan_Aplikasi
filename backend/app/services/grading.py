"""Penilaian jawaban soal evaluasi."""
from __future__ import annotations

from .numbers import format_number, parse_number


def is_correct(question: dict, answer: str | None) -> bool:
    if answer is None or str(answer).strip() == "":
        return False
    if question["type"] == "mc":
        return str(answer).strip().upper() == str(question["answer_key"]).upper()
    value = parse_number(answer)
    if value is None:
        return False
    key = float(question["answer_key"])
    tolerance = float(question.get("tolerance") or 0)
    return abs(value - key) <= tolerance + 1e-9


def correct_label(question: dict) -> str:
    if question["type"] == "mc":
        for opt in question.get("options") or []:
            if opt["id"] == question["answer_key"]:
                return opt["label"]
        return question["answer_key"]
    text = format_number(float(question["answer_key"]))
    return f"{text} {question['unit']}" if question.get("unit") else text


def score_of(correct: int, total: int) -> float:
    return round(correct / total * 100, 2) if total else 0.0
