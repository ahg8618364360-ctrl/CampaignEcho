import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.db.models import Brand, MemoryLog, MemoryVerificationRun, User
from backend.app.services.memory_service import MemoryService
from backend.app.api.v1.memory import get_memory_service
from backend.app.core.security import get_current_user, get_current_user_optional


UNIT_TEST_USER_ID = "unit-test-user-001"


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
        user_id=UNIT_TEST_USER_ID,
        name="The Taco Syndicate",
        industry="Fast-Casual Dining",
        description="Authentic Mexican street tacos near campus.",
        target_audience="University students (18-24)",
        market_region="Austin, TX",
        brand_voice="Energetic, witty",
        preferred_language="en",
        restrictions="No fine dining aesthetics",
        is_synthetic=False,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)
    return brand


@pytest.fixture
def test_brand_b(db_session):
    brand = Brand(
        user_id=UNIT_TEST_USER_ID,
        name="Luxe Parisian Spa",
        industry="Luxury Wellness",
        description="High-end skincare atelier",
        target_audience="HNW Individuals",
        market_region="Paris, France",
        brand_voice="Opulent",
        is_synthetic=False,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)
    return brand


@pytest.fixture
def client_with_mock_memory(db_session, mock_hindsight_client):
    # Dependency-injected service with authenticated credentials and live simulation
    service = MemoryService(
        hindsight_client=mock_hindsight_client,
        api_key="sk-test-live-key",
        is_live=True,
    )

    mock_user = User(
        id=UNIT_TEST_USER_ID,
        email="unit@campaignecho.test",
        full_name="Unit Tester",
        hashed_password="hashed_pw",
        is_active=True,
    )

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_memory_service():
        return service

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_memory_service] = override_memory_service
    app.dependency_overrides[get_current_user_optional] = lambda: mock_user
    app.dependency_overrides[get_current_user] = lambda: mock_user

    with TestClient(app) as test_client:
        yield test_client, service, mock_hindsight_client

    app.dependency_overrides.clear()


# =========================================================================
# Basic Memory Engine Operations Tests
# =========================================================================

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
    # Server strictly overrides caller-supplied is_synthetic=True on non-synthetic brands
    assert data["is_synthetic"] is False
    assert data["operation_id"] == "op-12345"
    assert data["duration_ms"] >= 0

    mock_hindsight_client.aretain.assert_called_once()
    call_kwargs = mock_hindsight_client.aretain.call_args.kwargs
    assert call_kwargs["bank_id"] == f"campaignecho-brand-{brand_id.lower()}"
    assert "Flash BOGO" in call_kwargs["content"]
    assert call_kwargs["metadata"]["is_synthetic"] == "false"
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


# =========================================================================
# Section 3: Regression Suite for OPERATIONS_VERIFIED Logic (Rules A through K)
# =========================================================================

def test_regression_a_no_operations_is_bank_provisioned(client_with_mock_memory, test_brand):
    """Rule A: When bank is provisioned but no operations have run, status is BANK_PROVISIONED."""
    test_client, _, _ = client_with_mock_memory
    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service_state"] == "BANK_PROVISIONED"
    assert data["bank_provisioned"] is True


def test_regression_b_retain_only_not_operations_verified(client_with_mock_memory, test_brand):
    """Rule B: RETAIN only does NOT result in OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-b-retain-only"

    # Execute RETAIN
    resp_ret = test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Observation", "verification_run_id": run_id},
    )
    assert resp_ret.status_code == 200

    # Status must still be BANK_PROVISIONED
    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_c_retain_recall_not_operations_verified(client_with_mock_memory, test_brand):
    """Rule C: RETAIN + RECALL only does NOT result in OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-c-retain-recall"

    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Observation", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Observation query", "verification_run_id": run_id},
    )

    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_d_retain_reflect_not_operations_verified(client_with_mock_memory, test_brand):
    """Rule D: RETAIN + REFLECT only does NOT result in OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-d-retain-reflect"

    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Observation", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Reflect query", "verification_run_id": run_id},
    )

    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_e_recall_reflect_not_operations_verified(client_with_mock_memory, test_brand):
    """Rule E: RECALL + REFLECT only does NOT result in OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-e-recall-reflect"

    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Observation query", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Reflect query", "verification_run_id": run_id},
    )

    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_f_all_three_in_same_run_is_operations_verified(client_with_mock_memory, test_brand):
    """Rule F: All three operations succeeding in the SAME valid live verification run -> OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-f-complete"

    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Verified takeaway", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Verified query", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Verified reflect", "verification_run_id": run_id},
    )

    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    data = resp.json()
    assert data["service_state"] == "OPERATIONS_VERIFIED"
    assert data["verification_run_id"] == run_id
    assert data["verified_at"] is not None
    assert "operations (retain, recall, reflect) verified" in data["message"].lower()


def test_regression_g_operations_across_unrelated_runs_not_verified(client_with_mock_memory, test_brand):
    """Rule G: All three operations spread across UNRELATED verification runs -> NOT OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory

    # Run 1: Retain only
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Takeaway 1", "verification_run_id": "run-alpha"},
    )
    # Run 2: Recall only
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Query 2", "verification_run_id": "run-beta"},
    )
    # Run 3: Reflect only
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Query 3", "verification_run_id": "run-gamma"},
    )

    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_h_one_operation_fails_not_operations_verified(client_with_mock_memory, test_brand, mock_hindsight_client):
    """Rule H: If any operation in the run fails, run status is FAILED -> NOT OPERATIONS_VERIFIED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-h-with-failure"

    # Retain succeeds
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Takeaway", "verification_run_id": run_id},
    )

    # Recall fails (simulating exception from engine)
    mock_hindsight_client.arecall.side_effect = Exception("Hindsight engine timeout")
    resp_fail = test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Query", "verification_run_id": run_id},
    )
    assert resp_fail.status_code == 502

    # Reset mock for reflect
    mock_hindsight_client.arecall.side_effect = None
    mock_hindsight_client.areflect.side_effect = None
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Query", "verification_run_id": run_id},
    )

    resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_i_mocked_test_operations_never_count_as_live(db_session, test_brand, mock_hindsight_client):
    """Rule I: Mocked test operations (is_live=False) NEVER count as real live operations."""
    service_mocked = MemoryService(
        hindsight_client=mock_hindsight_client,
        api_key="sk-fake",
        is_live=False,  # Explicitly non-live
    )

    def override_get_db():
        yield db_session

    mock_u = User(
        id=UNIT_TEST_USER_ID, email="unit@test.com", full_name="Unit", hashed_password="pw", is_active=True
    )
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_memory_service] = lambda: service_mocked
    app.dependency_overrides[get_current_user_optional] = lambda: mock_u
    app.dependency_overrides[get_current_user] = lambda: mock_u

    with TestClient(app) as test_client:
        run_id = "test-run-i-mocked"
        test_client.post(
            f"/api/v1/brands/{test_brand.id}/memory/retain",
            json={"content": "Mocked takeaway", "verification_run_id": run_id},
        )
        test_client.post(
            f"/api/v1/brands/{test_brand.id}/memory/recall",
            json={"query": "Mocked query", "verification_run_id": run_id},
        )
        test_client.post(
            f"/api/v1/brands/{test_brand.id}/memory/reflect",
            json={"query": "Mocked reflect", "verification_run_id": run_id},
        )

        resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
        # Must NOT be OPERATIONS_VERIFIED because operations were mocked (is_live=False)
        assert resp.json()["service_state"] == "BANK_PROVISIONED"

    app.dependency_overrides.clear()


def test_regression_j_different_brand_cannot_satisfy_verification(client_with_mock_memory, test_brand, test_brand_b):
    """Rule J: Operations run for Brand A cannot satisfy Brand B's verification."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-j-brand-a"

    # Complete all 3 for Brand A
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Takeaway for Brand A", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Query for Brand A", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Reflect for Brand A", "verification_run_id": run_id},
    )

    # Brand A is verified
    resp_a = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    assert resp_a.json()["service_state"] == "OPERATIONS_VERIFIED"

    # Brand B is strictly NOT verified
    resp_b = test_client.get(f"/api/v1/brands/{test_brand_b.id}/memory/status")
    assert resp_b.json()["service_state"] == "BANK_PROVISIONED"


def test_regression_k_revoked_authentication_returns_auth_required(client_with_mock_memory, test_brand, mock_hindsight_client):
    """Rule K: If cloud authentication is revoked (401 Unauthorized), do not display verified; return AUTH_REQUIRED."""
    test_client, _, _ = client_with_mock_memory
    run_id = "test-run-k-pre-verified"

    # 1. Complete verification run
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/retain",
        json={"content": "Takeaway", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/recall",
        json={"query": "Query", "verification_run_id": run_id},
    )
    test_client.post(
        f"/api/v1/brands/{test_brand.id}/memory/reflect",
        json={"query": "Query", "verification_run_id": run_id},
    )

    # Verified state reached
    assert test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status").json()["service_state"] == "OPERATIONS_VERIFIED"

    # 2. Simulate authentication revocation: cloud endpoint now returns 401 Unauthorized
    mock_hindsight_client.aget_bank_config.side_effect = Exception("401 Unauthorized: Invalid API key")

    resp_revoked = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
    data_revoked = resp_revoked.json()
    assert data_revoked["service_state"] == "AUTH_REQUIRED"
    assert data_revoked["service_connected"] is False
    assert "rejected the provided api key" in data_revoked["message"].lower()

    # Reset mock
    mock_hindsight_client.aget_bank_config.side_effect = None


# =========================================================================
# Additional Coverage Tests
# =========================================================================

def test_memory_status_unauthenticated_state(db_session, test_brand):
    """Verify unauthenticated state when no API key is provided."""
    unauthed_client = MagicMock()
    unauthed_client.aget_version = AsyncMock(return_value=MagicMock(api_version="1.1.0", version="1.1.0"))

    service = MemoryService(hindsight_client=unauthed_client, api_key=None, is_live=False)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_memory_service] = lambda: service
    app.dependency_overrides[get_current_user_optional] = lambda: User(
        id=UNIT_TEST_USER_ID, email="unit@test.com", full_name="Unit", hashed_password="pw", is_active=True
    )

    with TestClient(app) as test_client:
        resp = test_client.get(f"/api/v1/brands/{test_brand.id}/memory/status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["service_state"] == "AUTH_REQUIRED"
        assert data["service_connected"] is False
        assert data["bank_provisioned"] is False
        assert "authentication is required" in data["message"].lower()

    app.dependency_overrides.clear()


def test_memory_activity_telemetry(client_with_mock_memory, test_brand):
    test_client, _, _ = client_with_mock_memory
    brand_id = test_brand.id

    test_client.post(
        f"/api/v1/brands/{brand_id}/memory/retain",
        json={"content": "Macro visual clips drove 4.2x engagement."},
    )

    resp = test_client.get(f"/api/v1/brands/{brand_id}/memory/activity")
    assert resp.status_code == 200
    data = resp.json()
    assert data["brand_id"] == brand_id
    assert "bank_id" not in data
    assert data["total_count"] >= 1
    assert data["activities"][0]["operation_type"] == "RETAIN"
    assert data["activities"][0]["status"] == "SUCCESS"


def test_brand_isolation_boundary(client_with_mock_memory, db_session):
    brand_a = Brand(
        name="The Taco Syndicate",
        industry="Dining",
        description="Tacos",
        target_audience="Students",
        market_region="Austin",
        brand_voice="Casual",
    )
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

    mock_hindsight_client.aretain.side_effect = ConnectionError("Connection refused on port 8888")

    resp = test_client.post(
        f"/api/v1/brands/{brand_id}/memory/retain",
        json={"content": "Important takeaway that cannot be saved"},
    )
    assert resp.status_code == 502
    data = resp.json()
    assert "retention failed" in data["message"].lower()

    mock_hindsight_client.aretain.side_effect = None
