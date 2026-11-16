from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.constants import PracticeLevel, stars_for


# ---------- evaluasi ----------
class OptionOut(BaseModel):
    id: str
    label: str


class QuestionOut(BaseModel):
    """Soal untuk siswa — sengaja TANPA answer_key dan explanation."""
    id: str
    position: int
    type: str
    process: str
    prompt: str
    options: list[OptionOut] | None = None
    unit: str | None = None
    title: str | None = None
    max_points: int | None = None
    stages: list[dict[str, Any]] | None = None  # soal bertahap: tanpa kunci & pembahasan


class StartEvaluationResponse(BaseModel):
    attempt_id: str
    resumed: bool
    started_at: datetime
    expires_at: datetime
    server_time: datetime
    questions: list[QuestionOut]


class AnswerIn(BaseModel):
    question_id: str
    # Soal bertahap mengirim JSON {input_id: nilai}; soal biasa cukup pendek.
    answer: str | None = Field(default=None, max_length=2000)

    @field_validator("answer")
    @classmethod
    def _strip(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v = v.strip()
        return v or None


class SubmitEvaluationRequest(BaseModel):
    answers: list[AnswerIn] = Field(max_length=50)

    @model_validator(mode="after")
    def _no_duplicates(self):
        ids = [a.question_id for a in self.answers]
        if len(ids) != len(set(ids)):
            raise ValueError("Ada soal yang dijawab lebih dari sekali.")
        return self


class ReviewItem(BaseModel):
    position: int
    question_id: str | None = None
    prompt: str
    type: str | None = None
    process: str | None = None
    options: list[OptionOut] | None = None
    unit: str | None = None
    student_answer: str | None
    correct_answer: str | None
    correct_label: str | None = None
    is_correct: bool
    explanation: dict[str, Any] | None = None
    title: str | None = None
    points: float | None = None
    max_points: float | None = None
    stages: list[dict[str, Any]] | None = None


class AttemptSummary(BaseModel):
    id: str
    mode: str
    level: str | None = None
    score: float | None = None
    correct_count: int | None = None
    wrong_count: int | None = None
    total_questions: int
    stars: int | None = None
    duration_seconds: int | None = None
    started_at: datetime
    submitted_at: datetime | None = None
    timed_out: bool = False


class AttemptDetail(AttemptSummary):
    review: list[ReviewItem]


class SubmitEvaluationResponse(BaseModel):
    attempt_id: str
    score: float
    correct_count: int
    wrong_count: int
    total_questions: int
    duration_seconds: int
    timed_out: bool
    points_earned: float | None = None
    points_max: float | None = None
    review: list[ReviewItem]


# ---------- latihan ----------
class PracticeAnswerIn(BaseModel):
    position: int = Field(ge=1, le=50)
    prompt: str = Field(min_length=1, max_length=600)
    answer: str | None = Field(default=None, max_length=50)
    correct_answer: str = Field(max_length=120)
    is_correct: bool


class PracticeAttemptIn(BaseModel):
    level: PracticeLevel
    total_questions: int = Field(ge=1, le=20)
    correct_count: int = Field(ge=0)
    stars: int = Field(ge=0, le=3)
    duration_seconds: int = Field(ge=0, le=6 * 3600)
    answers: list[PracticeAnswerIn]

    @model_validator(mode="after")
    def _consistent(self):
        if self.correct_count > self.total_questions:
            raise ValueError("Jumlah benar tidak boleh melebihi jumlah soal.")
        if len(self.answers) != self.total_questions:
            raise ValueError("Jumlah jawaban tidak sama dengan jumlah soal.")
        if sum(a.is_correct for a in self.answers) != self.correct_count:
            raise ValueError("Jumlah jawaban benar tidak konsisten.")
        if self.stars != stars_for(self.correct_count, self.total_questions):
            raise ValueError("Jumlah bintang tidak sesuai aturan.")
        return self


class PracticeAttemptOut(BaseModel):
    attempt_id: str
    score: float
