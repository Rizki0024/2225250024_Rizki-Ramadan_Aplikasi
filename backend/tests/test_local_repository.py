"""Penyimpanan lokal JSON tahan terhadap penulisan bersamaan (regresi PermissionError di Windows)."""
import json
import threading

from app.services.repository.local import LocalRepository


def test_concurrent_saves_do_not_fail(tmp_path):
    repo = LocalRepository(tmp_path)
    errors: list[Exception] = []

    def worker(i: int) -> None:
        try:
            for _ in range(15):
                repo._db.setdefault("marks", []).append(i)
                repo._save()
        except Exception as exc:  # noqa: BLE001
            errors.append(exc)

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert errors == []
    data = json.loads((tmp_path / "db.json").read_text(encoding="utf-8"))
    assert len(data["marks"]) == 8 * 15
    assert not list(tmp_path.glob("*.tmp"))
