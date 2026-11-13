import re

import pytest

from app.models.constants import stars_for
from app.services.content import load_materials, load_questions
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
    assert len(qs) >= 10
    assert len({q["code"] for q in qs}) == len(qs)
    procs = {q["process"] for q in qs}
    assert procs == {"formulate", "employ", "interpret"}
    for q in qs:
        exp = q["explanation"]
        for key in ("diketahui", "ditanyakan", "rumus", "substitusi", "perhitungan", "jawaban"):
            assert exp.get(key), f"{q['code']} tanpa {key}"
        if q["type"] == "mc":
            ids = [o["id"] for o in q["options"]]
            assert q["answer_key"] in ids and len(ids) == len(set(ids)) >= 3
            labels = [o["label"] for o in q["options"]]
            assert len(labels) == len(set(labels))
        else:
            assert parse_number(q["answer_key"]) is not None and q["unit"]
        assert is_correct(q, q["answer_key"])
        assert correct_label(q)


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
