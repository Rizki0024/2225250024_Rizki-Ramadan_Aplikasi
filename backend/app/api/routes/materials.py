from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_repo
from app.schemas.material import MaterialDetail, MaterialSummary
from app.services.repository import Repository

router = APIRouter(prefix="/api/materials", tags=["materials"])


@router.get("", response_model=list[MaterialSummary])
def list_materials(repo: Repository = Depends(get_repo)):
    return repo.list_materials()


@router.get("/{slug}", response_model=MaterialDetail)
def get_material(slug: str, repo: Repository = Depends(get_repo)):
    material = repo.get_material(slug)
    if not material:
        raise HTTPException(404, "Materi tidak ditemukan.")
    return material
