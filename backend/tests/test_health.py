from app import create_app


def test_health_ok():
    app = create_app()
    client = app.test_client()
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "ok"
    assert body["service"] == "arskymap-backend"
