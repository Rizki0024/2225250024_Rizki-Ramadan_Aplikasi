from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from app.api.deps import get_current_student
from app.services import tutor
from app.services.content import find_segment

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


class Turn(BaseModel):
    role: Literal["student", "teacher"]
    text: str = Field(min_length=1, max_length=600)


class AskIn(BaseModel):
    lesson_slug: str = Field(min_length=1, max_length=40)
    segment_id: str = Field(min_length=1, max_length=40)
    question: str = Field(max_length=300)
    history: list[Turn] = Field(default_factory=list, max_length=6)
    simpler: bool = False
    intent: str | None = Field(default=None, max_length=60)

    @field_validator("question")
    @classmethod
    def _question(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Pertanyaan belum diisi.")
        return v


class AskOut(BaseModel):
    answer: str
    follow_up: str | None
    intent: str | None
    source: Literal["curated", "claude"]
    in_scope: bool
    can_simplify: bool


@router.get("/status")
def status(request: Request, student: dict = Depends(get_current_student)):
    return {"provider": "claude" if request.app.state.claude_tutor else "curated"}


@router.post("/ask", response_model=AskOut)
def ask(body: AskIn, request: Request, student: dict = Depends(get_current_student)):
    if not request.app.state.tutor_limiter.allow(student["id"]):
        raise HTTPException(429, "Kamu sudah banyak bertanya dalam waktu singkat. Istirahat sebentar, lalu coba lagi ya.")
    found = find_segment(body.lesson_slug, body.segment_id)
    if not found:
        raise HTTPException(404, "Bagian pelajaran tidak ditemukan.")
    _, segment = found
    reply, source = tutor.ask(body.question, segment, [t.model_dump() for t in body.history],
                              simpler=body.simpler, intent=body.intent, claude=request.app.state.claude_tutor)
    return AskOut(answer=reply.answer, follow_up=reply.follow_up, intent=reply.intent, source=source,
                  in_scope=reply.in_scope, can_simplify=reply.can_simplify)
