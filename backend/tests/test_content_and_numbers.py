import re

import pytest

from app.models.constants import stars_for
from app.services.content import load_materials, load_questions
from app.services.staged import grade as staged_grade
from app.services.grading import correct_label, is_correct
from app.services.numbers import format_number, parse_number


@pytest.mark.parametrize("text,expected", [
    ("216", 216), ("4,5", 4.5), ("1.800", 1800), ("12.000", 12000), ("12.000,5", 12000.5),
    ("4.5", 4.5), (" 158 ", 158), ("-3", -3),
    ("", None), ("   ", None), ("abc", None), ("216 cm", None), ("2,5,1", None), ("1.80.0", None), (None, None),
])
def test_parse_number(text, expected):
    assert parse_number(text) == expected


@pytest.mark.parametrize("value,text", [(216, "216"), (1800, "1.800"), (9000.0, "9.000"), (4.5, "4,5"), (2400, "2.400")])
def test_format_number(value, text):
    assert format_number(value) == text


def test_stars_rule():
    assert [stars_for(c, 5) for c in range(6)] == [0, 0, 0, 1, 2, 3]


def test_question_bank_integrity():
    qs = load_questions()
    assert len({q["code"] for q in qs}) == len(qs)
    active = [q for q in qs if q["is_active"]]
    # Evaluasi = 4 soal kisi-kisi Mathematical Literacy, skor maksimum 6 per indikator, total 24.
    assert {q["process"] for q in active} == {"reasoning", "formulate", "employ", "interpret"}
    assert len(active) == 4 and sum(q["max_points"] for q in active) == 24
    expected_split = {"ML-1": [1, 2, 1, 1, 1], "ML-2": [1] * 6, "ML-3": [1, 2, 2, 1], "ML-4": [1] * 6}
    for q in active:
        assert q["type"] == "staged" and q["indicator"] and q["title"]
        assert [st["points"] for st in q["stages"]] == expected_split[q["code"]]
        for st in q["stages"]:
            assert st["explanation"] and set(st["key"]) == {i["id"] for i in st["inputs"]}
            for inp in st["inputs"]:
                if inp["kind"] == "choice":
                    ids = [o["id"] for o in inp["options"]]
                    assert st["key"][inp["id"]] in ids and len(ids) == len(set(ids)) >= 3
        assert staged_grade(q, {k: str(v) for st in q["stages"] for k, v in st["key"].items()})["points"] == 6
    for q in qs:  # soal lama (nonaktif) tetap utuh untuk riwayat
        if q["type"] in ("mc", "numeric"):
            assert is_correct(q, q["answer_key"]) and correct_label(q)


def test_staged_keys_match_direct_calculation():
    """Kunci soal kisi-kisi diperiksa ulang dengan perhitungan langsung."""
    by = {q["code"]: q for q in load_questions()}
    lp = lambda p, l, t: 2 * (p * l + p * t + l * t)  # noqa: E731
    k = lambda code: {kk: v for st in by[code]["stages"] for kk, v in st["key"].items()}  # noqa: E731
    k1 = k("ML-1")
    assert (k1["t2a"], k1["t2b"], k1["t2c"]) == (6 * 20 * 20, lp(20, 15, 10), lp(22, 14, 9))
    assert k("ML-2")["t6"] == lp(40, 25, 15)
    assert k("ML-3")["t3L"] == lp(50, 30, 20) and k("ML-3")["t3sum"] == lp(50, 30, 20) / 2
    k4 = k("ML-4")
    assert k4["t5"] == lp(40, 30, 20) and k4["t2"] == 2 * 30 * 20 and lp(40, 30, 20) - 4000 == 1200


def test_question_bank_math():
    """Memeriksa ulang kunci jawaban dengan perhitungan langsung."""
    by = {q["code"]: q for q in load_questions()}
    lp_kubus = lambda s: 6 * s * s  # noqa: E731
    lp_balok = lambda p, l, t: 2 * (p * l + p * t + l * t)  # noqa: E731
    assert "216" in correct_label(by["EV-01"]) and lp_kubus(6) == 216
    assert float(by["EV-02"]["answer_key"]) == lp_balok(8, 5, 3)
    assert lp_kubus(float(by["EV-05"]["answer_key"])) == 150
    assert correct_label(by["EV-07"]).startswith("9.000") and 60 * 30 + 2 * 60 * 40 + 2 * 30 * 40 == 9000
    walls = 2 * 4 * 3 + 2 * 3 * 3
    assert float(by["EV-08"]["answer_key"]) == -(-walls // 10)
    assert lp_balok(10, 6, float(by["EV-09"]["answer_key"])) == 376
    assert lp_kubus(10) - lp_balok(12, 10, 8) == 8


def test_examples_in_materials_are_complete():
    for m in load_materials():
        for block in m["content"]:
            if block["type"] == "example":
                for key in ("soal", "diketahui", "ditanyakan", "rumus", "substitusi", "perhitungan", "jawaban"):
                    assert block.get(key), f"{m['slug']}/{block['title']} tanpa {key}"
                assert re.search(r"(cm²|m²|cm|m)$", block["jawaban"])
