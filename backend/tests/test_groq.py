"""Guru virtual gratis via Groq — diuji dengan klien HTTP tiruan (tanpa internet)."""
import httpx
import pytest

from app.core.config import Settings
from app.main import create_app
from app.services import tutor
from app.services.content import find_segment
from app.services.tutor.groq_provider import API_URL, GroqTutor, GroqUnavailable

SEG = find_segment("kubus", "kub-3")[1]


class FakeClient:
    """Meniru httpx.Client.post; `script` = daftar respons per panggilan (status, json, headers)."""

    def __init__(self, script):
        self.script = list(script)
        self.calls = []

    def post(self, url, json):
        self.calls.append({"url": url, "json": json})
        status, body, headers = self.script.pop(0)
        if isinstance(status, Exception):
            raise status
        return httpx.Response(status, json=body, headers=headers, request=httpx.Request("POST", url))


def ok(text):
    return (200, {"choices": [{"message": {"content": text}, "finish_reason": "stop"}]}, {})


class Clock:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t


def test_groq_answers_with_compact_rmt_prompt_and_cheap_reasoning():
    fake = FakeClient([ok("**Bagus!** Coba pikirkan: ada berapa sisi pada kubus? Luasnya 6 × s^2.")])
    g = GroqTutor("kunci-palsu", client=fake)
    text, in_scope = g.answer("kenapa dikali 6?", SEG, [{"role": "student", "text": "halo"}, {"role": "teacher", "text": "halo juga"}], False)
    assert in_scope and text == "Bagus! Coba pikirkan: ada berapa sisi pada kubus? Luasnya 6 × s²."
    body = fake.calls[0]["json"]
    assert fake.calls[0]["url"] == API_URL and body["model"] == "openai/gpt-oss-120b"
    assert body["reasoning_effort"] == "low" and body["include_reasoning"] is False
    system = body["messages"][0]
    assert system["role"] == "system" and "Rigorous Mathematical Thinking" in system["content"]
    # hemat token: hanya pelajaran yang sedang dibuka
    assert "Pelajaran: Luas Permukaan Kubus" in system["content"] and "Pelajaran: Luas Permukaan Balok" not in system["content"]
    assert len(system["content"]) < 6000
    roles = [m["role"] for m in body["messages"]]
    assert roles == ["system", "user", "assistant", "user"] and "kenapa dikali 6?" in body["messages"][-1]["content"]


def test_groq_switches_model_on_rate_limit_and_rests_it():
    clock = Clock()
    fake = FakeClient([(429, {"error": {"message": "rate limit"}}, {"retry-after": "20"}), ok("Jawaban model kedua."),
                       ok("Jawaban lagi.")])
    g = GroqTutor("k", client=fake, clock=clock)
    assert g.answer("apa itu rusuk?", SEG, [], False) == ("Jawaban model kedua.", True)
    assert [c["json"]["model"] for c in fake.calls] == ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"]
    assert "reasoning_effort" not in fake.calls[1]["json"]  # parameter khusus gpt-oss tidak dikirim ke Llama
    g.answer("lagi", SEG, [], False)
    assert fake.calls[2]["json"]["model"] == "llama-3.3-70b-versatile"  # model pertama masih istirahat
    clock.t += 21
    fake.script.append(ok("kembali"))
    g.answer("lagi", SEG, [], False)
    assert fake.calls[3]["json"]["model"] == "openai/gpt-oss-120b"


def test_groq_all_models_fail_falls_back_to_curated():
    fake = FakeClient([(429, {}, {}), (503, {}, {}), (httpx.ReadTimeout("lambat"), None, None)])
    g = GroqTutor("k", client=fake)
    with pytest.raises(GroqUnavailable):
        g.answer("kenapa dikali 6", SEG, [], False)
    fake2 = FakeClient([(429, {}, {})] * 3)
    reply, source = tutor.ask("kenapa dikali 6", SEG, [], providers=[GroqTutor("k", client=fake2)])
    assert source == "curated" and reply.intent == "kenapa-kali-6"


def test_groq_out_of_scope_tag():
    g = GroqTutor("k", client=FakeClient([ok("[DI-LUAR-MATERI] Itu di luar materi kita, yuk kembali ke kubus.")]))
    assert g.answer("siapa presiden pertama?", SEG, [], False) == ("Itu di luar materi kita, yuk kembali ke kubus.", False)


def test_chain_order_claude_then_groq():
    class Broken:
        name = "claude"

        def answer(self, *a):
            raise RuntimeError("kredit habis")

    g = GroqTutor("k", client=FakeClient([ok("Dari Groq.")]))
    reply, source = tutor.ask("apa itu jaring-jaring?", SEG, [], providers=[Broken(), g])
    assert source == "groq" and reply.answer == "Dari Groq." and reply.follow_up
    reply, source = tutor.ask("ulangi", SEG, [], providers=[g])
    assert source == "curated" and reply.intent == "repeat"


def test_app_enables_groq_from_env(tmp_path):
    app = create_app(Settings(local_data_dir=tmp_path, allowed_origins=["http://localhost:5173"], groq_api_key="gsk_palsu",
                              groq_models=("openai/gpt-oss-20b",)))
    assert [t.name for t in app.state.ai_tutors] == ["groq"] and app.state.ai_tutors[0].models == ["openai/gpt-oss-20b"]
    from fastapi.testclient import TestClient
    assert TestClient(app).get("/api/health").json()["tutor"] == "groq"
