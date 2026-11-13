"""Logika evaluasi: membuat sesi acak, menilai, dan menyusun pembahasan."""
from __future__ import annotations

import random
import threading
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.core.config import Settings

from . import grading
from .repository import Repository


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_dt(value) -> datetime:
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def build_order(questions: list[dict], rng: random.Random | None = None) -> list[dict]:
    """Urut menurut tingkat kesulitan; acak di dalam tingkat yang sama; opsi PG diacak."""
    rng = rng or random.SystemRandom()
    groups: dict[int, list[dict]] = {}
    for q in questions:
        groups.setdefault(int(q["difficulty"]), []).append(q)
    order = []
    for level in sorted(groups):
        items = groups[level][:]
        rng.shuffle(items)
        for q in items:
            option_ids = [o["id"] for o in (q.get("options") or [])]
            rng.shuffle(option_ids)
            order.append({"id": q["id"], "options": option_ids})
    return order


def _ordered_options(q: dict, option_ids: list[str]) -> list[dict] | None:
    if q["type"] != "mc":
        return None
    by_id = {o["id"]: o for o in q.get("options") or []}
    return [{"id": i, "label": by_id[i]["label"]} for i in option_ids if i in by_id]


def _questions_by_id(repo: Repository) -> dict[str, dict]:
    return {q["id"]: q for q in repo.list_evaluation_questions()}


def public_questions(attempt: dict, repo: Repository) -> list[dict]:
    qmap = _questions_by_id(repo)
    out = []
    for pos, item in enumerate(attempt["question_order"], start=1):
        q = qmap.get(item["id"])
        if not q:
            continue
        out.append({
            "id": q["id"], "position": pos, "type": q["type"], "process": q["process"],
            "prompt": q["prompt"], "options": _ordered_options(q, item["options"]), "unit": q.get("unit"),
        })
    return out


_start_locks: dict[str, threading.Lock] = {}
_start_locks_guard = threading.Lock()


def _lock_for(student_id: str) -> threading.Lock:
    with _start_locks_guard:
        return _start_locks.setdefault(student_id, threading.Lock())


def start(repo: Repository, settings: Settings, student_id: str) -> dict:
    """Satu siswa hanya boleh punya satu evaluasi berjalan; permintaan bersamaan diserialkan."""
    with _lock_for(student_id):
        return _start(repo, settings, student_id)


def _start(repo: Repository, settings: Settings, student_id: str) -> dict:
    now = now_utc()
    open_attempt = repo.find_open_evaluation(student_id)
    if open_attempt and parse_dt(open_attempt["expires_at"]) > now:
        attempt, resumed = open_attempt, True
    else:
        if open_attempt:  # sudah lewat waktu dan belum dikirim
            repo.update_attempt(open_attempt["id"], {"status": "expired"}, only_if_status=["in_progress"])
        questions = repo.list_evaluation_questions()
        if not questions:
            raise HTTPException(503, "Soal evaluasi belum tersedia. Hubungi guru.")
        attempt = repo.create_attempt({
            "student_id": student_id, "mode": "evaluasi", "status": "in_progress",
            "question_order": build_order(questions), "total_questions": len(questions),
            "started_at": now.isoformat(),
            "expires_at": (now + timedelta(minutes=settings.evaluation_minutes)).isoformat(),
        })
        resumed = False
    return {
        "attempt_id": attempt["id"], "resumed": resumed,
        "started_at": parse_dt(attempt["started_at"]), "expires_at": parse_dt(attempt["expires_at"]),
        "server_time": now, "questions": public_questions(attempt, repo),
    }


def _review_item(pos: int, q: dict, option_ids: list[str], answer: str | None, correct: bool) -> dict:
    return {
        "position": pos, "question_id": q["id"], "prompt": q["prompt"], "type": q["type"],
        "process": q["process"], "options": _ordered_options(q, option_ids), "unit": q.get("unit"),
        "student_answer": answer, "correct_answer": q["answer_key"],
        "correct_label": grading.correct_label(q), "is_correct": correct,
        "explanation": q.get("explanation"),
    }


def submit(repo: Repository, settings: Settings, student_id: str, attempt_id: str, answers: list[dict]) -> dict:
    attempt = repo.get_attempt(attempt_id, student_id)
    if not attempt or attempt["mode"] != "evaluasi":
        raise HTTPException(404, "Data evaluasi tidak ditemukan.")
    if attempt["status"] == "submitted":
        raise HTTPException(400, "Evaluasi ini sudah dikumpulkan.")

    order = attempt["question_order"]
    allowed = {item["id"] for item in order}
    given = {a["question_id"]: a["answer"] for a in answers}
    unknown = set(given) - allowed
    if unknown:
        raise HTTPException(422, "Ada jawaban untuk soal yang tidak termasuk evaluasi ini.")

    qmap = _questions_by_id(repo)
    now = now_utc()
    started = parse_dt(attempt["started_at"])
    expires = parse_dt(attempt["expires_at"])
    timed_out = now > expires + timedelta(seconds=settings.submit_grace_seconds)
    duration = int(max(0, (min(now, expires) - started).total_seconds()))

    review, rows, correct_count = [], [], 0
    for pos, item in enumerate(order, start=1):
        q = qmap.get(item["id"])
        if not q:
            continue
        ans = given.get(q["id"])
        ok = grading.is_correct(q, ans)
        correct_count += ok
        review.append(_review_item(pos, q, item["options"], ans, ok))
        rows.append({"attempt_id": attempt_id, "question_id": q["id"], "position": pos,
                     "answer_text": ans, "is_correct": ok})

    total = len(review)
    score = grading.score_of(correct_count, total)
    updated = repo.update_attempt(attempt_id, {
        "status": "submitted", "submitted_at": now.isoformat(), "duration_seconds": duration,
        "correct_count": correct_count, "wrong_count": total - correct_count, "score": score,
        "total_questions": total, "timed_out": timed_out,
    }, only_if_status=["in_progress", "expired"])
    if updated is None:  # kiriman ganda bersamaan
        raise HTTPException(400, "Evaluasi ini sudah dikumpulkan.")
    repo.insert_answers(rows)

    return {
        "attempt_id": attempt_id, "score": score, "correct_count": correct_count,
        "wrong_count": total - correct_count, "total_questions": total,
        "duration_seconds": duration, "timed_out": timed_out, "review": review,
    }


def attempt_review(repo: Repository, attempt: dict) -> list[dict]:
    answers = repo.list_answers(attempt["id"])
    if attempt["mode"] == "latihan":
        out = []
        for a in answers:
            snap = a.get("question_snapshot") or {}
            out.append({
                "position": a["position"], "prompt": snap.get("prompt", ""),
                "student_answer": a.get("answer_text"), "correct_answer": snap.get("correct_answer"),
                "correct_label": snap.get("correct_answer"), "is_correct": a["is_correct"],
            })
        return out
    qmap = _questions_by_id(repo)
    option_order = {item["id"]: item["options"] for item in attempt.get("question_order") or []}
    out = []
    for a in answers:
        q = qmap.get(a.get("question_id"))
        if not q:
            continue
        out.append(_review_item(a["position"], q, option_order.get(q["id"], []), a.get("answer_text"), a["is_correct"]))
    return out
