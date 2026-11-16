"""Konstanta domain yang dipakai bersama oleh skema, layanan, dan route."""
from typing import Literal

Mode = Literal["latihan", "evaluasi"]
AttemptStatus = Literal["in_progress", "submitted", "expired"]
QuestionType = Literal["mc", "numeric"]
Process = Literal["formulate", "employ", "interpret"]
PracticeLevel = Literal["prasyarat", "kubus", "balok", "soal-cerita", "literasi", "bank"]

PRACTICE_LEVELS: tuple[str, ...] = ("prasyarat", "kubus", "balok", "soal-cerita")

CODE_PATTERN = r"^[A-Z0-9-]{3,20}$"
PIN_PATTERN = r"^\d{4,6}$"


def stars_for(correct: int, total: int) -> int:
    """Aturan bintang latihan (lihat docs/question-blueprint.md)."""
    if total <= 0:
        return 0
    ratio = correct / total
    if ratio >= 1:
        return 3
    if ratio >= 0.8:
        return 2
    if ratio >= 0.6:
        return 1
    return 0
