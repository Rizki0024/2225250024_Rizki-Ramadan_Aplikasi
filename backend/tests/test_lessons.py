import re

from app.services.content import load_lessons, load_questions
from app.services.tutor.curated import load_kb

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


# Nilai yang kebetulan sama dengan hasil contoh lain berukuran berbeda (bukan kebocoran soal).
ALLOWED_COINCIDENCE = {2400: "hasil contoh kotak sepatu (bal-4), ukurannya berbeda dari Kotak A ML-1"}


def test_content_does_not_leak_staged_evaluation():
    """Ukuran & jawaban 4 soal kisi-kisi tidak boleh muncul di naskah kelas, bank tanya-jawab, maupun materi."""
    from app.services.content import load_materials

    corpus = " ".join(str(x) for x in (load_lessons(), load_materials(), load_kb()))
    flat = re.sub(r"(?<=\d)\.(?=\d{3})", "", corpus)  # 1.264 → 1264
    for q in load_questions():
        if q["type"] != "staged" or not q["is_active"]:
            continue
        nums = re.findall(r"\d+", q["prompt"].replace(".", ""))
        for a, b, c in zip(nums, nums[1:], nums[2:]):  # tiga ukuran berurutan (p, l, t) milik soal ini
            if min(int(a), int(b), int(c)) >= 8:
                pat = rf"\b{a}\D{{1,8}}{b}\D{{1,8}}{c}\b"
                assert not re.search(pat, flat), f"{q['code']}: ukuran {a} × {b} × {c} muncul di konten"
        # Jawaban angka tahap terakhir yang berisi angka (hasil akhir soal) tidak boleh muncul di konten.
        last_numeric = [st for st in q["stages"] if any(i["kind"] == "number" for i in st["inputs"])][-1]
        for v in last_numeric["key"].values():
            if int(v) in ALLOWED_COINCIDENCE:
                continue
            assert not re.search(rf"\b{int(v)}\b", flat), f"{q['code']}: jawaban {v} muncul di konten"


def test_every_segment_has_rmt_phase():
    for lesson in load_lessons():
        for seg in lesson["segments"]:
            assert seg["rmt"]["phase"] in {"Input", "Elaborasi", "Output", "Refleksi"} and seg["rmt"]["focus"]
    concepts = {seg["concept"] for lesson in load_lessons() for seg in lesson["segments"]}
    assert {"bernalar", "memeriksa"} <= concepts
