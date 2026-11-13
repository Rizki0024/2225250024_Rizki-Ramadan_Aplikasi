from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.deps import get_current_student, get_repo, get_settings
from app.core.config import Settings
from app.schemas.quiz import StartEvaluationResponse, SubmitEvaluationRequest, SubmitEvaluationResponse
from app.services import evaluation
from app.services.repository import Repository

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])


@router.post("/start", response_model=StartEvaluationResponse)
def start_evaluation(student: dict = Depends(get_current_student),
                     settings: Settings = Depends(get_settings), repo: Repository = Depends(get_repo)):
    return evaluation.start(repo, settings, student["id"])


@router.post("/{attempt_id}/submit", response_model=SubmitEvaluationResponse)
def submit_evaluation(attempt_id: UUID, body: SubmitEvaluationRequest,
                      student: dict = Depends(get_current_student),
                      settings: Settings = Depends(get_settings), repo: Repository = Depends(get_repo)):
    answers = [a.model_dump() for a in body.answers]
    return evaluation.submit(repo, settings, student["id"], str(attempt_id), answers)
