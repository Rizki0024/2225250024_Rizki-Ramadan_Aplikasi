from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class MaterialSummary(BaseModel):
    slug: str
    title: str
    shape: str
    order_no: int
    summary: str


class MaterialDetail(MaterialSummary):
    content: list[dict[str, Any]]
