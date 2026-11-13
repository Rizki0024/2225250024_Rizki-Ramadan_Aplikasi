from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_student, get_repo
from app.schemas.quiz import AttemptDetail, AttemptSummary
from app.services.evaluation import attempt_review
from app.services.repository import Repository

router = APIRouter(prefix="/api/attempts", tags=["attempts"])


@router.get("", response_model=list[AttemptSummary])
def list_attempts(student: dict = Depends(get_current_student), repo: Repository = Depends(get_repo)):
    return repo.list_attempts(student["id"])


@router.get("/{attempt_id}", response_model=AttemptDetail)
def get_attempt(attempt_id: UUID, student: dict = Depends(get_current_student),
                repo: Repository = Depends(get_repo)):
    attempt = repo.get_attempt(str(attempt_id), student["id"])
    if not attempt or attempt["status"] != "submitted":
        raise HTTPException(404, "Data hasil tidak ditemukan.")
    return {**attempt, "review": attempt_review(repo, attempt)}
