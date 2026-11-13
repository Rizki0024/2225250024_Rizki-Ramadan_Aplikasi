from tests.conftest import login


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["storage"] == "local"


def test_login_success_lowercase_code(client):
    r = client.post("/api/auth/login", json={"code": " kb-001 ", "pin": "1234"})
    assert r.status_code == 200
    body = r.json()
    assert body["student"]["nickname"] == "Elang"
    assert body["student"]["code"] == "KB-001"
    assert "pin_hash" not in body["student"]


def test_login_wrong_pin_and_unknown_code_same_message(client):
    a = client.post("/api/auth/login", json={"code": "KB-001", "pin": "0000"})
    b = client.post("/api/auth/login", json={"code": "KB-999", "pin": "1234"})
    assert a.status_code == b.status_code == 401
    assert a.json()["detail"] == b.json()["detail"] == "Kode siswa atau PIN salah."


def test_login_validation_messages(client):
    r = client.post("/api/auth/login", json={"code": "", "pin": "1234"})
    assert r.status_code == 422 and r.json()["detail"] == "Kode siswa wajib diisi."
    r = client.post("/api/auth/login", json={"code": "KB-001", "pin": "12a"})
    assert r.status_code == 422 and r.json()["detail"] == "PIN harus 4–6 angka."
    r = client.post("/api/auth/login", json={"code": "KB 001!", "pin": "1234"})
    assert r.status_code == 422 and "Format kode" in r.json()["detail"]
    r = client.post("/api/auth/login", json={"code": "KB-001"})
    assert r.status_code == 422 and r.json()["detail"] == "PIN wajib diisi."


def test_login_lockout_after_5_failures(client):
    for _ in range(5):
        assert client.post("/api/auth/login", json={"code": "KB-002", "pin": "0000"}).status_code == 401
    r = client.post("/api/auth/login", json={"code": "KB-002", "pin": "2345"})
    assert r.status_code == 429
    # kode lain tidak ikut terkunci
    login(client, "KB-003", "3456")


def test_me_requires_valid_token(client, auth):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer palsu"}).status_code == 401
    r = client.get("/api/auth/me", headers=auth)
    assert r.status_code == 200 and r.json()["code"] == "KB-001"


def test_token_signed_with_other_secret_rejected(client):
    from app.core.security import create_token
    me = client.post("/api/auth/login", json={"code": "KB-001", "pin": "1234"}).json()["student"]
    forged, _ = create_token(me["id"], "KB-001", "rahasia-lain-yang-bukan-milik-server-123", 1)
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {forged}"}).status_code == 401
