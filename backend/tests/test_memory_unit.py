import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.db.models import Brand, MemoryLog
from backend.app.services.memory_service import MemoryService
from backend.app.api.v1.memory import get_memory_service


@pytest.fixture
def mock_hindsight_client():
    client = MagicMock()
    # Async methods on Hindsight client
    client.aget_version = AsyncMock(return_value=MagicMock(api_version="1.2.0", version="1.2.0"))
    client.aget_bank_config = AsyncMock(return_value={"bank_id": "test", "name": "Test Bank"})
    client.acreate_bank = AsyncMock(return_value=MagicMock(bank_id="test"))
    client.aretain = AsyncMock(return_value=MagicMock(operation_id="op-12345"))

    # Mock recall response
    mock_memory_unit = MagicMock()
    mock_memory_unit.id = "mem-1"
    mock_memory_unit.content = "Late night BOGO offers after 9 PM drove 380 redemptions."
    mock_memory_unit.type = "observation"
    mock_memory_unit.score = 0.92
    mock_memory_unit.tags = ["synthetic", "campaign_postmortem"]
    mock_memory_unit.metadata = {"is_synthetic": "true", "campaign_id": "camp-1"}
    mock_memory_unit.timestamp = "2026-11-05T12:00:00Z"

    mock_recall_resp = MagicMock()
    mock_recall_resp.results = [mock_memory_unit]
    client.arecall = AsyncMock(return_value=mock_recall_resp)

    # Mock reflect response
    mock_reflect_resp = MagicMock()
    mock_reflect_resp.reflection = "Flash discounts after 9 PM consistently outperform daytime promotional offers."
    mock_reflect_resp.facts = [{"fact": "Macro video clips drove 4.2x engagement."}]
    client.areflect = AsyncMock(return_value=mock_reflect_resp)

    client.alist_memories = AsyncMock(return_value=MagicMock(total=1, items=[mock_memory_unit]))
    return client


@pytest.fixture
def test_brand(db_session):
    brand = Brand(
        name="The Taco Syndicate",
        industry="Fast-Casual Dining",
        description="Authentic Mexican street tacos near campus.",
        target_audience="University students (18-24)",
        market_region="Austin, TX",
        brand_voice="Energetic, witty",
        preferred_language="en",
        restrictions="No fine dining aesthetics",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)
    return brand


@pytest.fixture
def client_with_mock_memory(db_session, mock_hindsight_client):
    service = MemoryService(hindsight_client=mock_hindsight_client)

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_memory_service():
        return service

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_memory_service] = override_memory_service

    with TestClient(app) as test_client:
        yield test_client, service, mock_hindsight_client

    app.dependency_overrides.clear()


def test_bank_provisioning_idempotency(client_with_mock_memory, test_brand, mock_hindsight_client):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    # First provision: bank is created
    resp1 = test_client.post(f"/api/v1/brands/{brand_id}/memory/provision")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["brand_id"] == brand_id
    assert data1["bank_provisioned"] is True
    assert "bank_id" not in data1  # Strict ADR-002: Bank ID never exposed to client
    assert data1["status"] in ["PROVISIONED", "ALREADY_EXISTS"]

    # Second provision: idempotent, returns ALREADY_EXISTS
    mock_hindsight_client.aget_bank_config.return_value = {"status": "active"}
    resp2 = test_client.post(f"/api/v1/brands/{brand_id}/memory/provision")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["status"] == "ALREADY_EXISTS"
    assert "bank_id" not in data2


def test_memory_retain_success(client_with_mock_memory, test_brand, mock_hindsight_client):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    payload = {
        "content": "Flash BOGO promotions after 9 PM drove 380 redemptions with university students.",
        "context": "Late night delivery campaign",
        "is_synthetic": True,
        "source_type": "CAMPAIGN_POSTMORTEM",
        "campaign_id": "c1a2b3",
        "tags": ["bogo", "late_night", "austin"],
    }

    resp = test_client.post(f"/api/v1/brands/{brand_id}/memory/retain", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["brand_id"] == brand_id
    assert "bank_id" not in data  # ADR-002: no bank ID leakage
    assert data["status"] == "SUCCESS"
    assert data["is_synthetic"] is True
    assert data["operation_id"] == "op-12345"
    assert data["duration_ms"] >= 0

    # Verify call to Hindsight client
    mock_hindsight_client.aretain.assert_called_once()
    call_kwargs = mock_hindsight_client.aretain.call_args.kwargs
    assert call_kwargs["bank_id"] == f"campaignecho-brand-{brand_id.lower()}"
    assert "Flash BOGO" in call_kwargs["content"]
    assert call_kwargs["metadata"]["is_synthetic"] == "true"
    assert call_kwargs["metadata"]["brand_id"] == brand_id


def test_memory_recall_success(client_with_mock_memory, test_brand, mock_hindsight_client):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    payload = {
        "query": "What late night promotions worked best?",
        "budget": "mid",
        "tags": ["bogo"],
    }

    resp = test_client.post(f"/api/v1/brands/{brand_id}/memory/recall", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["brand_id"] == brand_id
    assert data["query"] == payload["query"]
    assert data["total_results"] == 1
    assert len(data["results"]) == 1
    assert "Late night BOGO" in data["results"][0]["content"]
    assert data["results"][0]["score"] == 0.92

    mock_hindsight_client.arecall.assert_called_once()


def test_memory_reflect_success(client_with_mock_memory, test_brand, mock_hindsight_client):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    payload = {
        "query": "What campaign themes consistently succeed with students?",
        "budget": "low",
    }

    resp = test_client.post(f"/api/v1/brands/{brand_id}/memory/reflect", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["brand_id"] == brand_id
    assert "Flash discounts after 9 PM" in data["reflection"]
    assert len(data["facts"]) == 1

    mock_hindsight_client.areflect.assert_called_once()


def test_memory_status_connected(client_with_mock_memory, test_brand, mock_hindsight_client):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    resp = test_client.get(f"/api/v1/brands/{brand_id}/memory/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["brand_id"] == brand_id
    assert data["bank_provisioned"] is True
    assert "bank_id" not in data  # ADR-002: no bank ID leakage
    assert data["service_connected"] is True
    assert data["engine_status"] == "CONNECTED"


def test_memory_activity_telemetry(client_with_mock_memory, test_brand, db_session):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    # Retain a memory
    test_client.post(
        f"/api/v1/brands/{brand_id}/memory/retain",
        json={"content": "Macro visual clips drove 4.2x engagement."},
    )

    # Retrieve activity
    resp = test_client.get(f"/api/v1/brands/{brand_id}/memory/activity")
    assert resp.status_code == 200
    data = resp.json()
    assert data["brand_id"] == brand_id
    assert "bank_id" not in data  # ADR-002: no bank ID leakage
    assert data["total_count"] >= 1
    assert data["activities"][0]["operation_type"] == "RETAIN"
    assert data["activities"][0]["status"] == "SUCCESS"


def test_brand_isolation_boundary(client_with_mock_memory, db_session):
    test_client, _, _ = client_with_mock_memory

    # Create Brand A: The Taco Syndicate
    brand_a = Brand(
        name="The Taco Syndicate",
        industry="Dining",
        description="Tacos",
        target_audience="Students",
        market_region="Austin",
        brand_voice="Casual",
    )
    # Create Brand B: Luxe Parisian Spa
    brand_b = Brand(
        name="Luxe Parisian Spa",
        industry="Hospitality",
        description="Luxury spa",
        target_audience="High net worth",
        market_region="Paris",
        brand_voice="Elegance",
    )
    db_session.add_all([brand_a, brand_b])
    db_session.commit()
    db_session.refresh(brand_a)
    db_session.refresh(brand_b)

    bank_id_a = MemoryService.get_bank_id_for_brand(brand_a.id)
    bank_id_b = MemoryService.get_bank_id_for_brand(brand_b.id)

    # Strictly different bank IDs
    assert bank_id_a != bank_id_b
    assert bank_id_a == f"campaignecho-brand-{brand_a.id.lower()}"
    assert bank_id_b == f"campaignecho-brand-{brand_b.id.lower()}"


def test_nonexistent_brand_returns_404(client_with_mock_memory):
    test_client, _, _ = client_with_mock_memory
    fake_id = "00000000-0000-0000-0000-000000000000"

    resp = test_client.get(f"/api/v1/brands/{fake_id}/memory/status")
    assert resp.status_code == 404
    data = resp.json()
    assert "not found" in data["message"].lower()


def test_hindsight_unreachable_error_handling(client_with_mock_memory, test_brand, mock_hindsight_client):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    # Simulate Hindsight service failure
    mock_hindsight_client.aretain.side_effect = ConnectionError("Connection refused on port 8888")

    resp = test_client.post(
        f"/api/v1/brands/{brand_id}/memory/retain",
        json={"content": "Important takeaway that cannot be saved"},
    )
    assert resp.status_code == 502
    data = resp.json()
    assert "retention failed" in data["message"].lower()

