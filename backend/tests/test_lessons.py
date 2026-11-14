import re

from app.services.content import load_lessons, load_questions

VALID_POSES = {"idle", "wave", "talk", "point", "listen", "think", "cheer"}
VALID_EXPR = {"neutral", "happy", "explaining", "thinking", "listening", "proud"}


def test_lessons_api(client):
    r = client.get("/api/lessons")
    assert [x["slug"] for x in r.json()] == ["prasyarat", "kubus", "balok", "soal-cerita"]
    d = client.get("/api/lessons/kubus").json()
    assert d["segments"][0]["script"][0]["say"]
    assert client.get("/api/lessons/volume").status_code == 404


def test_lesson_integrity():
    seen = set()
    for lesson in load_lessons():
        assert lesson["segments"]
        for seg in lesson["segments"]:
            assert seg["id"] not in seen
            seen.add(seg["id"])
            assert seg["goal"] and seg["concept"] and seg["board"] and seg["script"]
            for line in seg["script"]:
                assert 0 < len(line["say"]) <= 220, seg["id"]  # kalimat pendek (beban kognitif)
                assert line["show"] is None or 0 <= line["show"] < len(seg["board"])
                assert line["pose"] in VALID_POSES and line["expression"] in VALID_EXPR
            if "check" in seg:
                c = seg["check"]
                assert 0 <= c["answer"] < len(c["options"]) and c["explain"]
                assert len(set(c["options"])) == len(c["options"])


def test_lessons_do_not_leak_evaluation_items():
    """Contoh di kelas guru tidak boleh memakai angka soal evaluasi."""
    text = str(load_lessons())
    for q in load_questions():
        nums = re.findall(r"\d+", q["prompt"])
        if len(nums) >= 2:
            pattern = r"\D+".join(nums)
            assert not re.search(pattern, text), f"{q['code']} bocor di naskah kelas"
