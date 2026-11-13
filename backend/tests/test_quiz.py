from datetime import datetime, timedelta, timezone

from app.services.content import load_questions
from tests.conftest import login

KEYS = {q["id"]: q for q in load_questions()}


def _all_correct(questions):
    out = []
    for q in questions:
        key = KEYS[q["id"]]["answer_key"]
        out.append({"question_id": q["id"], "answer": key})
    return out


def test_materials(client):
    r = client.get("/api/materials")
    assert [m["slug"] for m in r.json()] == ["prasyarat", "kubus", "balok", "soal-cerita"]
    d = client.get("/api/materials/kubus").json()
    assert any(b["type"] == "example" for b in d["content"])
    assert client.get("/api/materials/tidak-ada").status_code == 404


def test_start_hides_answer_keys_and_orders_by_difficulty(client, auth):
    r = client.post("/api/evaluations/start", headers=auth)
    assert r.status_code == 200
    body = r.json()
    assert len(body["questions"]) == 10
    text = r.text
    assert "answer_key" not in text and "explanation" not in text and "perhitungan" not in text
    diffs = [KEYS[q["id"]]["difficulty"] for q in body["questions"]]
    assert diffs == sorted(diffs)


def test_start_resumes_open_attempt(client, auth):
    a = client.post("/api/evaluations/start", headers=auth).json()
    b = client.post("/api/evaluations/start", headers=auth).json()
    assert b["resumed"] is True and a["attempt_id"] == b["attempt_id"]
    assert [q["id"] for q in a["questions"]] == [q["id"] for q in b["questions"]]


def test_concurrent_start_creates_single_attempt(client, auth):
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=4) as pool:
        ids = list(pool.map(lambda _: client.post("/api/evaluations/start", headers=auth).json()["attempt_id"], range(4)))
    assert len(set(ids)) == 1


def test_submit_all_correct(client, auth):
    s = client.post("/api/evaluations/start", headers=auth).json()
    r = client.post(f"/api/evaluations/{s['attempt_id']}/submit", headers=auth,
                    json={"answers": _all_correct(s["questions"])})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["score"] == 100 and body["correct_count"] == 10 and body["wrong_count"] == 0
    assert all(item["explanation"]["jawaban"] for item in body["review"])
    # kirim ulang ditolak
    r2 = client.post(f"/api/evaluations/{s['attempt_id']}/submit", headers=auth, json={"answers": []})
    assert r2.status_code == 400


def test_submit_partial_and_indonesian_numbers(client, auth):
    s = client.post("/api/evaluations/start", headers=auth).json()
    by_code = {KEYS[q["id"]]["code"]: q["id"] for q in s["questions"]}
    answers = [
        {"question_id": by_code["EV-02"], "answer": "158"},
        {"question_id": by_code["EV-05"], "answer": "5,0"},
        {"question_id": by_code["EV-08"], "answer": "4,2"},   # tidak dibulatkan → salah
        {"question_id": by_code["EV-09"], "answer": "abc"},   # format salah → salah
        {"question_id": by_code["EV-01"], "answer": "A"},     # pengecoh
    ]
    body = client.post(f"/api/evaluations/{s['attempt_id']}/submit", headers=auth,
                       json={"answers": answers}).json()
    assert body["correct_count"] == 2 and body["wrong_count"] == 8 and body["score"] == 20
    ev08 = next(i for i in body["review"] if i["question_id"] == by_code["EV-08"])
    assert ev08["correct_label"] == "5 kaleng" and ev08["is_correct"] is False


def test_submit_rejects_foreign_question_and_duplicates(client, auth):
    s = client.post("/api/evaluations/start", headers=auth).json()
    url = f"/api/evaluations/{s['attempt_id']}/submit"
    r = client.post(url, headers=auth, json={"answers": [{"question_id": "x", "answer": "1"}]})
    assert r.status_code == 422
    qid = s["questions"][0]["id"]
    r = client.post(url, headers=auth, json={"answers": [{"question_id": qid, "answer": "1"},
                                                         {"question_id": qid, "answer": "2"}]})
    assert r.status_code == 422 and "lebih dari sekali" in r.json()["detail"]


def test_cannot_read_or_submit_other_students_attempt(client, auth):
    s = client.post("/api/evaluations/start", headers=auth).json()
    client.post(f"/api/evaluations/{s['attempt_id']}/submit", headers=auth, json={"answers": []})
    other = login(client, "KB-002", "2345")
    assert client.get(f"/api/attempts/{s['attempt_id']}", headers=other).status_code == 404
    assert client.get(f"/api/attempts/{s['attempt_id']}", headers=auth).status_code == 200
    s2 = client.post("/api/evaluations/start", headers=auth).json()
    assert client.post(f"/api/evaluations/{s2['attempt_id']}/submit", headers=other,
                       json={"answers": []}).status_code == 404
    assert client.get("/api/attempts", headers=other).json() == []
    assert client.get("/api/attempts/bukan-uuid", headers=auth).status_code == 404


def test_expired_attempt_is_replaced_and_late_submit_flagged(client, auth, app):
    repo = app.state.repo
    s = client.post("/api/evaluations/start", headers=auth).json()
    past = datetime.now(timezone.utc) - timedelta(minutes=10)
    repo.update_attempt(s["attempt_id"], {"expires_at": past.isoformat(),
                                          "started_at": (past - timedelta(minutes=30)).isoformat()})
    late = client.post(f"/api/evaluations/{s['attempt_id']}/submit", headers=auth, json={"answers": []}).json()
    assert late["timed_out"] is True and late["duration_seconds"] == 30 * 60

    s2 = client.post("/api/evaluations/start", headers=auth).json()
    repo.update_attempt(s2["attempt_id"], {"expires_at": past.isoformat()})
    s3 = client.post("/api/evaluations/start", headers=auth).json()
    assert s3["attempt_id"] != s2["attempt_id"] and s3["resumed"] is False


def test_practice_save_and_history(client, auth):
    answers = [{"position": i, "prompt": f"Soal {i}", "answer": "10", "correct_answer": "10",
                "is_correct": i <= 4} for i in range(1, 6)]
    payload = {"level": "kubus", "total_questions": 5, "correct_count": 4, "stars": 2,
               "duration_seconds": 120, "answers": answers}
    r = client.post("/api/practice/attempts", headers=auth, json=payload)
    assert r.status_code == 201 and r.json()["score"] == 80
    hist = client.get("/api/attempts", headers=auth).json()
    assert hist[0]["mode"] == "latihan" and hist[0]["stars"] == 2
    detail = client.get(f"/api/attempts/{hist[0]['id']}", headers=auth).json()
    assert len(detail["review"]) == 5 and detail["review"][0]["prompt"] == "Soal 1"


def test_practice_validation(client, auth):
    answers = [{"position": 1, "prompt": "x", "answer": "1", "correct_answer": "1", "is_correct": True}]
    base = {"level": "kubus", "total_questions": 1, "correct_count": 1, "stars": 3,
            "duration_seconds": 10, "answers": answers}
    assert client.post("/api/practice/attempts", headers=auth, json=base).status_code == 201
    bad_stars = {**base, "stars": 1}
    r = client.post("/api/practice/attempts", headers=auth, json=bad_stars)
    assert r.status_code == 422 and "bintang" in r.json()["detail"]
    bad_level = {**base, "level": "volume"}
    assert client.post("/api/practice/attempts", headers=auth, json=bad_level).status_code == 422
    bad_count = {**base, "correct_count": 2}
    assert client.post("/api/practice/attempts", headers=auth, json=bad_count).status_code == 422
    assert client.post("/api/practice/attempts", json=base).status_code == 401
