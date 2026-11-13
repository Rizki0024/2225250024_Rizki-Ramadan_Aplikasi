"""Antarmuka penyimpanan. Route API hanya bergantung pada kelas ini."""
from __future__ import annotations

from abc import ABC, abstractmethod


class RepositoryUnavailable(Exception):
    """Database tidak dapat dihubungi."""


class Repository(ABC):
    mode: str = "abstract"

    # --- siswa ---
    @abstractmethod
    def get_student_by_code(self, code: str) -> dict | None: ...

    @abstractmethod
    def get_student(self, student_id: str) -> dict | None: ...

    @abstractmethod
    def touch_login(self, student_id: str) -> None: ...

    # --- konten ---
    @abstractmethod
    def list_materials(self) -> list[dict]: ...

    @abstractmethod
    def get_material(self, slug: str) -> dict | None: ...

    @abstractmethod
    def list_evaluation_questions(self) -> list[dict]: ...

    # --- attempt ---
    @abstractmethod
    def create_attempt(self, data: dict) -> dict: ...

    @abstractmethod
    def get_attempt(self, attempt_id: str, student_id: str) -> dict | None:
        """Hanya mengembalikan attempt milik student_id."""

    @abstractmethod
    def find_open_evaluation(self, student_id: str) -> dict | None: ...

    @abstractmethod
    def update_attempt(self, attempt_id: str, data: dict, only_if_status: list[str] | None = None) -> dict | None:
        """Mengembalikan baris terbaru, atau None jika status tidak cocok (mencegah kirim ganda)."""

    @abstractmethod
    def list_attempts(self, student_id: str) -> list[dict]:
        """Attempt yang sudah dikumpulkan, terbaru dahulu."""

    # --- jawaban ---
    @abstractmethod
    def insert_answers(self, rows: list[dict]) -> None: ...

    @abstractmethod
    def list_answers(self, attempt_id: str) -> list[dict]: ...
