from datetime import timedelta

from fastapi import APIRouter, Depends

from app.api.deps import get_current_student, get_repo
from app.schemas.quiz import PracticeAttemptIn, PracticeAttemptOut
from app.services.evaluation import now_utc
from app.services.grading import score_of
from app.services.repository import Repository

router = APIRouter(prefix="/api/practice", tags=["practice"])


@router.post("/attempts", response_model=PracticeAttemptOut, status_code=201)
def save_practice(body: PracticeAttemptIn, student: dict = Depends(get_current_student),
                  repo: Repository = Depends(get_repo)):
    now = now_utc()
    score = score_of(body.correct_count, body.total_questions)
    attempt = repo.create_attempt({
        "student_id": student["id"], "mode": "latihan", "level": body.level, "status": "submitted",
        "question_order": [], "total_questions": body.total_questions,
        "started_at": (now - timedelta(seconds=body.duration_seconds)).isoformat(),
        "submitted_at": now.isoformat(), "duration_seconds": body.duration_seconds,
        "correct_count": body.correct_count, "wrong_count": body.total_questions - body.correct_count,
        "score": score, "stars": body.stars,
    })
    repo.insert_answers([{
        "attempt_id": attempt["id"], "question_id": None, "position": a.position,
        "question_snapshot": {"prompt": a.prompt, "correct_answer": a.correct_answer},
        "answer_text": a.answer, "is_correct": a.is_correct,
    } for a in body.answers])
    return PracticeAttemptOut(attempt_id=attempt["id"], score=score)
