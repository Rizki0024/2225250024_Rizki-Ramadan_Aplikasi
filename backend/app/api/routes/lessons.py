from fastapi import APIRouter, HTTPException

from app.services.content import load_lessons

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("")
def list_lessons():
    return [
        {"slug": x["slug"], "title": x["title"], "order_no": x["order_no"], "summary": x["summary"],
         "material_slug": x["material_slug"], "segment_count": len(x["segments"])}
        for x in load_lessons()
    ]


@router.get("/{slug}")
def get_lesson(slug: str):
    for x in load_lessons():
        if x["slug"] == slug:
            return x
    raise HTTPException(404, "Pelajaran tidak ditemukan.")
