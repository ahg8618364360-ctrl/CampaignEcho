from unittest.mock import MagicMock
from fastapi import status
from sqlalchemy.exc import OperationalError
from backend.app.db.session import get_db
from backend.app.main import create_app
from fastapi.testclient import TestClient


def test_health_live(client):
    """Test that /api/v1/health/live returns HTTP 200 with alive status."""
    response = client.get("/api/v1/health/live")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "alive"}


def test_health_ready_success(client):
    """Test that /api/v1/health/ready returns HTTP 200 when database is healthy."""
    response = client.get("/api/v1/health/ready")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
    assert "version" in data


def test_health_ready_database_failure():
    """Test that /api/v1/health/ready returns HTTP 503 when database is unreachable."""
    app = create_app()
    mock_db = MagicMock()
    mock_db.execute.side_effect = OperationalError("Connection refused", {}, None)

    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/health/ready")
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        data = response.json()
        assert "detail" in data
        assert data["detail"]["status"] == "unready"
        assert data["detail"]["database"] == "disconnected"


def test_cors_headers(client):
    """Test CORS headers on preflight / request."""
    response = client.options(
        "/api/v1/health/live",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"

