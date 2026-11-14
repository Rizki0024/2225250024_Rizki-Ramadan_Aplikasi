from types import SimpleNamespace

import pytest

from app.core.config import Settings
from app.main import create_app
from app.services import tutor
from app.services.content import find_segment
from app.services.tutor import curated
from app.services.tutor.claude_provider import OUT_OF_SCOPE_TAG, ClaudeTutor
from tests.conftest import login

SEG_KUBUS = find_segment("kubus", "kub-3")[1]
SEG_BALOK = find_segment("balok", "bal-3")[1]
SEG_CERITA = find_segment("soal-cerita", "cer-3")[1]


@pytest.mark.parametrize("question,intent", [
    ("Bu, saya masih bingung. Kenapa harus dikalikan enam?", "kenapa-kali-6"),
    ("kenapa dikali 6??", "kenapa-kali-6"),
    ("apa bedanya luas permukaan dengan volume", "luas-vs-volume"),
    ("rusuk itu apa?", "apa-rusuk"),
    ("kalau kotaknya tanpa tutup gimana?", "tanpa-tutup"),
    ("rumus balok apa bu", "rumus-balok"),
    ("terima kasih bu", "terima-kasih"),
])
def test_curated_intents(question, intent):
    r = curated.answer(question, SEG_KUBUS)
    assert r.intent == intent and r.in_scope


def test_context_boost_picks_balok_for_kali_2():
    r = curated.answer("kenapa dikali dua?", SEG_BALOK)
    assert r.intent == "kenapa-kali-2" and "berpasangan" in r.answer


def test_guided_calc_does_not_reveal_final_answer_first():
    r = curated.answer("berapa luas permukaan kubus kalau rusuknya 5 cm?", SEG_KUBUS)
    assert r.intent.startswith("calc-kubus") and "5 × 5 = 25" in r.answer and "150" not in r.answer
    reveal = curated.answer("belum paham", SEG_KUBUS, simpler=True, intent=r.intent)
    assert "150" in reveal.answer


def test_guided_calc_balok():
    r = curated.answer("hitung luas balok 8 x 5 x 3", SEG_BALOK)
    assert "79" in r.answer and "158" not in r.answer
    assert "158" in curated.answer("", SEG_BALOK, simpler=True, intent=r.intent).answer


def test_arithmetic_and_indonesian_decimal():
    assert "= 150" in curated.answer("berapa 6 kali 25", SEG_KUBUS).answer
    assert "4,5" in curated.answer("54 bagi 12", SEG_CERITA).answer


def test_repeat_and_example_use_current_segment():
    r = curated.answer("bu tolong ulangi", SEG_KUBUS)
    assert r.intent == "repeat" and SEG_KUBUS["script"][0]["say"] in r.answer
    ex = curated.answer("contohnya gimana?", SEG_CERITA)
    assert ex.intent == "example" and "54" in ex.answer


def test_simpler_explanation_differs():
    first = curated.answer("kenapa dikali 6", SEG_KUBUS)
    simpler = curated.answer("belum", SEG_KUBUS, simpler=True, intent=first.intent)
    assert simpler.answer != first.answer and "dadu" in simpler.answer


def test_single_topic_word_does_not_trigger_unrelated_answer():
    r = curated.answer("apakah kubus bisa menggelinding seperti bola?", SEG_KUBUS)
    assert r.intent is None and "6 × s × s" not in r.answer


def test_out_of_scope_and_unclear():
    off = curated.answer("siapa presiden pertama indonesia?", SEG_KUBUS)
    assert off.in_scope is False and "di luar materi" in off.answer
    unclear = curated.answer("luas yang itu loh", SEG_KUBUS)
    assert unclear.in_scope is True and unclear.intent is None


# ---------- endpoint ----------
def test_tutor_requires_login(client):
    r = client.post("/api/tutor/ask", json={"lesson_slug": "kubus", "segment_id": "kub-3", "question": "kenapa 6"})
    assert r.status_code == 401


def test_tutor_ask_endpoint(client, auth):
    body = {"lesson_slug": "kubus", "segment_id": "kub-3", "question": "kenapa dikali enam?"}
    r = client.post("/api/tutor/ask", headers=auth, json=body)
    assert r.status_code == 200
    data = r.json()
    assert data["source"] == "curated" and data["intent"] == "kenapa-kali-6" and data["follow_up"]
    assert client.get("/api/tutor/status", headers=auth).json() == {"provider": "curated"}


def test_tutor_validation(client, auth):
    base = {"lesson_slug": "kubus", "segment_id": "kub-3"}
    r = client.post("/api/tutor/ask", headers=auth, json={**base, "question": "   "})
    assert r.status_code == 422 and r.json()["detail"] == "Pertanyaan belum diisi."
    assert client.post("/api/tutor/ask", headers=auth, json={**base, "question": "x" * 301}).status_code == 422
    assert client.post("/api/tutor/ask", headers=auth, json={**base, "segment_id": "zzz", "question": "a"}).status_code == 404
    too_long_history = [{"role": "student", "text": "a"}] * 7
    assert client.post("/api/tutor/ask", headers=auth, json={**base, "question": "a", "history": too_long_history}).status_code == 422


def test_tutor_rate_limit(tmp_path):
    c = __import__("fastapi.testclient", fromlist=["TestClient"]).TestClient(
        create_app(Settings(local_data_dir=tmp_path, tutor_max_requests=3)))
    a = login(c)
    body = {"lesson_slug": "kubus", "segment_id": "kub-3", "question": "rusuk itu apa"}
    codes = [c.post("/api/tutor/ask", headers=a, json=body).status_code for _ in range(4)]
    assert codes == [200, 200, 200, 429]


# ---------- penyedia Claude (client tiruan, tanpa biaya) ----------
class FakeMessages:
    def __init__(self, text="Jawaban dari AI.", stop="end_turn", raise_exc=None):
        self.text, self.stop, self.raise_exc, self.calls = text, stop, raise_exc, []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self.raise_exc:
            raise self.raise_exc
        return SimpleNamespace(stop_reason=self.stop, stop_details=None,
                               content=[SimpleNamespace(type="thinking", thinking=""), SimpleNamespace(type="text", text=self.text)])


def fake_claude(model="claude-opus-5-5", **kw):
    msgs = FakeMessages(**kw)
    client = SimpleNamespace(messages=msgs, beta=SimpleNamespace(messages=msgs))
    return ClaudeTutor("kunci-palsu", model, client=client), msgs


def test_claude_not_called_when_curated_confident():
    claude, msgs = fake_claude()
    reply, source = tutor.ask("kenapa dikali 6", SEG_KUBUS, [], claude=claude)
    assert source == "curated" and msgs.calls == []


def test_claude_used_for_unknown_question_with_context_and_fallbacks():
    claude, msgs = fake_claude()
    reply, source = tutor.ask("apakah kubus bisa menggelinding seperti bola?", SEG_KUBUS,
                              [{"role": "student", "text": "halo"}, {"role": "teacher", "text": "halo juga"}], claude=claude)
    assert source == "claude" and reply.answer == "Jawaban dari AI." and reply.follow_up
    call = msgs.calls[0]
    assert call["fallbacks"] == "default" and "server-side-fallback-2026-07-01" in call["betas"]
    assert call["messages"][0]["role"] == "user" and "kub-3" not in call["messages"][-1]["content"]
    assert "Rumus luas permukaan kubus" in call["messages"][-1]["content"] or "Menurunkan rumus" in call["messages"][-1]["content"]
    assert "6 × s × s" in call["system"][0]["text"]


def test_claude_haiku_has_no_server_fallback_param():
    claude, msgs = fake_claude(model="claude-haiku-5-5")
    tutor.ask("apakah kubus bisa menggelinding seperti bola?", SEG_KUBUS, [], claude=claude)
    assert "fallbacks" not in msgs.calls[0]


def test_claude_out_of_scope_tag():
    claude, _ = fake_claude(text=f"{OUT_OF_SCOPE_TAG} Tanyakan kepada guru di kelas ya.")
    reply, source = tutor.ask("ceritakan sejarah candi", SEG_KUBUS, [], claude=claude)
    assert source == "claude" and reply.in_scope is False and OUT_OF_SCOPE_TAG not in reply.answer


@pytest.mark.parametrize("kw", [{"stop": "refusal"}, {"raise_exc": RuntimeError("jaringan putus")}, {"text": "   "}])
def test_claude_failure_falls_back_to_curated(kw):
    claude, _ = fake_claude(**kw)
    reply, source = tutor.ask("luas yang itu loh", SEG_KUBUS, [], claude=claude)
    assert source == "curated" and reply.answer
