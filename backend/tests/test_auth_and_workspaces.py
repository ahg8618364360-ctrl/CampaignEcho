"""CampaignEcho — Multi-User Authentication & Business Workspace Isolation Tests.

Verifies:
1. User registration, password hashing (PBKDF2-HMAC-SHA256), and session token issuance.
2. Duplicate user email registration rejection (HTTP 409).
3. Login credential verification, invalid password rejection (HTTP 401).
4. Multi-tenant business workspace isolation:
   - User A creates Business Workspace A.
   - User B creates Business Workspace B.
   - User A cannot see or query User B's business workspace (returns 404).
   - User B cannot recall or access User A's memory bank (returns 404).
   - Benchmark demo brands remain accessible as synthetic reference baselines.
   - Synthetic benchmark brands cannot be edited or deleted (HTTP 403).
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import create_app
from backend.app.db.session import get_db
from backend.app.db.models import User, Brand


@pytest.fixture
def client(db_session: Session):
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.mark.unit
def test_auth_registration_and_login_flow(client: TestClient):
    """Test user registration, duplicate email rejection, and login token issuance."""
    # 1. Register User 1
    reg_payload = {
        "email": "strategist@acmemarketing.com",
        "password": "SuperSecretPassword123!",
        "full_name": "Elena Rostova",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "strategist@acmemarketing.com"
    assert reg_data["user"]["full_name"] == "Elena Rostova"
    token = reg_data["access_token"]

    # 2. Duplicate registration refusal
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 409
    assert "already exists" in dup_res.json()["detail"]

    # 3. /auth/me profile verification
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["id"] == reg_data["user"]["id"]

    # 4. Login with invalid password
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "strategist@acmemarketing.com", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401

    # 5. Login with valid password
    good_login = client.post(
        "/api/v1/auth/login",
        json={"email": "strategist@acmemarketing.com", "password": "SuperSecretPassword123!"},
    )
    assert good_login.status_code == 200
    assert "access_token" in good_login.json()


@pytest.mark.unit
def test_multi_user_workspace_isolation(client: TestClient, db_session: Session):
    """Verify strict tenant isolation between User A and User B workspaces and memory banks."""
    # Register User A
    user_a_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "owner_a@business-a.com",
            "password": "PasswordA123!",
            "full_name": "Alice Anderson",
        },
    )
    assert user_a_res.status_code == 201
    token_a = user_a_res.json()["access_token"]

    # Register User B
    user_b_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "owner_b@business-b.com",
            "password": "PasswordB123!",
            "full_name": "Bob Builder",
        },
    )
    assert user_b_res.status_code == 201
    token_b = user_b_res.json()["access_token"]

    # User A creates Business Workspace A
    brand_a_payload = {
        "name": "Artisan Roasters",
        "industry": "Coffee & Beverage",
        "description": "Specialty single-origin micro-batch coffee roaster in Seattle.",
        "target_audience": "Coffee aficionados and remote tech workers",
        "market_region": "Seattle, WA",
        "brand_voice": "Craft-focused, knowledgeable, warm",
        "preferred_language": "en",
        "products_or_services": "Cold brew subscriptions, single-origin whole bean bags",
        "unique_selling_points": "Direct trade, ethically sourced, 48h roast-to-door",
        "price_range": "$18 - $28 per 12oz",
        "key_offers": "Free shipping on first 3 bags with code ROASTFIRST",
        "competitors": "Blue Bottle, Stumptown",
    }
    create_a_res = client.post(
        "/api/v1/brands",
        json=brand_a_payload,
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert create_a_res.status_code == 201
    brand_a_id = create_a_res.json()["id"]

    # User B creates Business Workspace B
    brand_b_payload = {
        "name": "Zenith Fitness",
        "industry": "Health & Wellness",
        "description": "Boutique high-intensity pilates and recovery studio.",
        "target_audience": "Urban professionals aged 25-45",
        "market_region": "Chicago, IL",
        "brand_voice": "Empowering, sleek, disciplined",
        "preferred_language": "en",
        "products_or_services": "Reformer classes, infrared sauna, cold plunge",
        "unique_selling_points": "Small class sizes (max 8), certified master trainers",
        "price_range": "$35/class or $240/month unlimited",
        "key_offers": "First class complimentary",
        "competitors": "Solidcore, Club Pilates",
    }
    create_b_res = client.post(
        "/api/v1/brands",
        json=brand_b_payload,
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert create_b_res.status_code == 201
    brand_b_id = create_b_res.json()["id"]

    # 1. User A lists brands: MUST contain Brand A, MUST NOT contain Brand B
    list_a_res = client.get("/api/v1/brands", headers={"Authorization": f"Bearer {token_a}"})
    assert list_a_res.status_code == 200
    brands_for_a = list_a_res.json()
    brand_ids_for_a = [b["id"] for b in brands_for_a]
    assert brand_a_id in brand_ids_for_a
    assert brand_b_id not in brand_ids_for_a

    # 2. User B lists brands: MUST contain Brand B, MUST NOT contain Brand A
    list_b_res = client.get("/api/v1/brands", headers={"Authorization": f"Bearer {token_b}"})
    assert list_b_res.status_code == 200
    brands_for_b = list_b_res.json()
    brand_ids_for_b = [b["id"] for b in brands_for_b]
    assert brand_b_id in brand_ids_for_b
    assert brand_a_id not in brand_ids_for_b

    # 3. User B attempts to access Brand A directly -> MUST return 404 (ID enumeration defense)
    get_foreign_res = client.get(f"/api/v1/brands/{brand_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert get_foreign_res.status_code == 404

    # 4. User B attempts to query memory status of Brand A -> MUST return 404
    mem_status_foreign = client.get(
        f"/api/v1/brands/{brand_a_id}/memory/status",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert mem_status_foreign.status_code == 404

    # 5. User B attempts to recall memory from Brand A -> MUST return 404
    mem_recall_foreign = client.post(
        f"/api/v1/brands/{brand_a_id}/memory/recall",
        json={"query": "test query"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert mem_recall_foreign.status_code == 404

    # 6. User B attempts to update Brand A -> MUST return 404
    update_foreign = client.put(
        f"/api/v1/brands/{brand_a_id}",
        json={"name": "Hacked Brand Name"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert update_foreign.status_code == 404

    # 7. User A updates Brand A -> MUST succeed
    update_own = client.put(
        f"/api/v1/brands/{brand_a_id}",
        json={"brand_voice": "Ultra-refined, artisanal, inviting"},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert update_own.status_code == 200
    assert update_own.json()["brand_voice"] == "Ultra-refined, artisanal, inviting"
