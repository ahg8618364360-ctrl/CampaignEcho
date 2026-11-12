"""CampaignEcho M8.1 — Security Remediation & Multi-Tenant Certification Tests.

Exhaustively verifies all M8.1 security mandates:
1. Fail-closed auth secret validation (empty, placeholder, <32 chars).
2. Server-managed revocable database sessions:
   - DB record in user_sessions with SHA-256 token hash.
   - HttpOnly cookie delivery on login and register.
   - Immediate server-side revocation on logout (revoked_at timestamp set).
   - Replay of revoked session yields HTTP 401 Unauthorized.
   - Replay of expired session yields HTTP 401 Unauthorized.
3. OWASP 600k PBKDF2 password hashing & transparent rehash-on-login from 100k.
4. Strict campaign and comparison ownership:
   - Foreign campaign GET returns 404.
   - Foreign campaign results submission returns 404.
   - Foreign comparison GET returns 404.
   - Foreign comparison POST returns 404.
5. Synthetic benchmark immutability:
   - Direct retain into Taco Syndicate memory bank returns 403 Forbidden.
   - Memory verification suite on synthetic brand returns 403 Forbidden.
   - Campaign results submission against synthetic brand returns 403 Forbidden.
   - Profile edit on synthetic brand returns 403 Forbidden.
   - Archive/delete on synthetic brand returns 403 Forbidden.
6. Internal identifier privacy:
   - Brand responses never expose user_id or hindsight_bank_id.
"""

import base64
import hashlib
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import create_app
from backend.app.db.session import get_db
from backend.app.db.models import User, UserSession, Brand, Campaign, CampaignComparison
from backend.app.core.config import validate_auth_secret
from backend.app.core.security import (
    hash_password,
    verify_password,
    needs_rehash,
    create_user_session,
    revoke_user_session,
    reset_rate_limits,
    SESSION_COOKIE_NAME,
)


@pytest.fixture
def client(db_session: Session):
    reset_rate_limits()
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


# ==============================================================================
# 1. Auth Secret Fail-Closed Tests
# ==============================================================================

def test_auth_secret_validation_rejects_missing_weak_and_placeholders():
    """Verify validate_auth_secret fails closed under all invalid configurations."""
    # Empty / None
    with pytest.raises(RuntimeError, match="missing"):
        validate_auth_secret("")
    with pytest.raises(RuntimeError, match="missing"):
        validate_auth_secret("   ")

    # Too short (< 32 chars)
    with pytest.raises(RuntimeError, match="too short"):
        validate_auth_secret("short-secret-1234")

    # Placeholders
    with pytest.raises(RuntimeError, match="forbidden placeholder"):
        validate_auth_secret("your_auth_secret_here_replace_now_32chars")
    with pytest.raises(RuntimeError, match="forbidden placeholder"):
        validate_auth_secret("placeholder_key_with_sufficient_length_1234")

    # Valid secret
    valid_key = "a" * 32
    assert validate_auth_secret(valid_key) == valid_key


# ==============================================================================
# 2. Revocable Sessions & HttpOnly Cookies
# ==============================================================================

def test_session_lifecycle_httponly_cookie_and_revocation(client: TestClient, db_session: Session):
    """Verify session creation in DB, HttpOnly cookie, and immediate 401 upon logout revocation."""
    # 1. Register User
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "session_test@campaignecho.io",
            "password": "ValidPassword999!",
            "full_name": "Session Tester",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    raw_token = reg_data["access_token"]
    user_id = reg_data["user"]["id"]

    # Verify HttpOnly cookie in response headers
    set_cookie = reg_res.headers.get("set-cookie", "")
    assert SESSION_COOKIE_NAME in set_cookie
    assert "httponly" in set_cookie.lower()

    # Verify session record in database
    token_digest = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    session_row = db_session.query(UserSession).filter(UserSession.token_hash == token_digest).first()
    assert session_row is not None
    assert session_row.user_id == user_id
    assert session_row.revoked_at is None
    assert session_row.expires_at > datetime.now(timezone.utc).replace(tzinfo=None)

    # 2. Access /auth/me with Bearer token (clear cookie jar first)
    client.cookies.clear()
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {raw_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "session_test@campaignecho.io"

    # 3. Access /auth/me with session cookie
    client.cookies.set(SESSION_COOKIE_NAME, raw_token)
    me_cookie_res = client.get("/api/v1/auth/me")
    assert me_cookie_res.status_code == 200
    assert me_cookie_res.json()["id"] == user_id
    client.cookies.clear()

    # 4. Logout (revokes session)
    logout_res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {raw_token}"})
    assert logout_res.status_code == 200

    # Verify session marked revoked in DB
    db_session.refresh(session_row)
    assert session_row.revoked_at is not None

    # 5. Replay revoked token -> MUST return 401 Unauthorized
    replay_bearer = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {raw_token}"})
    assert replay_bearer.status_code == 401

    client.cookies.set(SESSION_COOKIE_NAME, raw_token)
    replay_cookie = client.get("/api/v1/auth/me")
    assert replay_cookie.status_code == 401
    client.cookies.clear()


def test_expired_session_returns_401(client: TestClient, db_session: Session):
    """Verify expired session in database returns 401 Unauthorized."""
    user = User(
        email="expired_test@campaignecho.io",
        hashed_password=hash_password("Password123!"),
        full_name="Expired User",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Create session with past expiration
    raw_token = "expired_raw_token_xyz_12345"
    token_digest = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
    expired_session = UserSession(
        user_id=user.id,
        token_hash=token_digest,
        created_at=now_naive - timedelta(days=10),
        expires_at=now_naive - timedelta(days=3),
        revoked_at=None,
    )
    db_session.add(expired_session)
    db_session.commit()

    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {raw_token}"})
    assert res.status_code == 401


# ==============================================================================
# 3. Password Hashing (600k) & Transparent Rehash Upgrade
# ==============================================================================

def test_password_hash_600k_and_transparent_upgrade_on_login(client: TestClient, db_session: Session):
    """Verify new hashes use 600,000 iterations and legacy 100,000 hashes upgrade on login."""
    # 1. New password hash check
    new_hash = hash_password("MySecurePassword123!")
    assert "pbkdf2_sha256$600000$" in new_hash
    assert needs_rehash(new_hash) is False
    assert verify_password("MySecurePassword123!", new_hash) is True

    # 2. Simulate legacy 100k hash
    salt = b"test_salt_123456"
    pw_hash = hashlib.pbkdf2_hmac("sha256", "LegacyPassword123!".encode("utf-8"), salt, 100000)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    hash_b64 = base64.b64encode(pw_hash).decode("ascii")
    legacy_hash = f"pbkdf2_sha256$100000${salt_b64}${hash_b64}"

    assert needs_rehash(legacy_hash) is True
    assert verify_password("LegacyPassword123!", legacy_hash) is True

    # Create user with legacy hash in DB
    user = User(
        email="legacy_user@campaignecho.io",
        hashed_password=legacy_hash,
        full_name="Legacy User",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # 3. Login with correct password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "legacy_user@campaignecho.io", "password": "LegacyPassword123!"},
    )
    assert login_res.status_code == 200

    # Verify user's hash was automatically upgraded to 600,000 in DB
    db_session.refresh(user)
    assert "pbkdf2_sha256$600000$" in user.hashed_password
    assert needs_rehash(user.hashed_password) is False


# ==============================================================================
# 4. Campaign & Comparison Ownership Enforcement
# ==============================================================================

def test_campaign_and_comparison_ownership_enforcement(client: TestClient, db_session: Session):
    """Verify User B cannot access User A's campaigns or comparisons (returns 404)."""
    # Create User A & Brand A
    reg_a = client.post(
        "/api/v1/auth/register",
        json={"email": "user_a@campaignecho.io", "password": "PasswordA123!", "full_name": "Alice A"},
    )
    token_a = reg_a.json()["access_token"]
    user_a_id = reg_a.json()["user"]["id"]

    brand_a = Brand(
        user_id=user_a_id,
        name="Brand Alpha",
        industry="SaaS",
        description="Alpha cloud software",
        target_audience="DevOps leads",
        market_region="Global",
        brand_voice="Direct",
        is_synthetic=False,
        hindsight_bank_id=f"campaignecho-brand-alpha",
    )
    db_session.add(brand_a)
    db_session.commit()
    db_session.refresh(brand_a)

    # Create Campaign for Brand A
    campaign_a = Campaign(
        brand_id=brand_a.id,
        name="Alpha Q1 Launch",
        brief="Launch cloud tools",
        objective="Lead Generation",
        platform="LinkedIn",
        status="ACTIVE",
    )
    db_session.add(campaign_a)
    db_session.commit()
    db_session.refresh(campaign_a)

    # Create Comparison for Brand A
    comparison_a = CampaignComparison(
        brand_id=brand_a.id,
        name="Alpha Comparison",
        campaign_brief={"name": "Alpha Brief", "objective": "Lead Generation", "platform": "LinkedIn"},
        baseline_strategy={"campaign_concept": "Concept A", "main_objective": "Lead Generation"},
        memory_strategy={"campaign_concept": "Concept B", "main_objective": "Lead Generation"},
        provider="zai",
        model="glm-4.5-flash",
        generation_parameters={"temperature": 0.7},
        comparison_summary={"mode_a_observations": 0, "mode_b_observations": 3},
    )
    db_session.add(comparison_a)
    db_session.commit()
    db_session.refresh(comparison_a)

    # Register User B
    reg_b = client.post(
        "/api/v1/auth/register",
        json={"email": "user_b@campaignecho.io", "password": "PasswordB123!", "full_name": "Bob B"},
    )
    token_b = reg_b.json()["access_token"]

    # 1. User B requests User A's campaign -> MUST return 404
    get_camp_res = client.get(
        f"/api/v1/campaigns/{campaign_a.id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert get_camp_res.status_code == 404

    # 2. User B requests User A's comparison -> MUST return 404
    get_comp_res = client.get(
        f"/api/v1/campaigns/compare/{comparison_a.id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert get_comp_res.status_code == 404

    # 3. User B lists comparisons without brand_id -> MUST NOT include Comparison A
    list_comp_res = client.get(
        "/api/v1/campaigns/compare",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert list_comp_res.status_code == 200
    comp_ids = [c["id"] for c in list_comp_res.json()]
    assert comparison_a.id not in comp_ids

    # 4. User B attempts to submit results to User A's campaign -> MUST return 404
    submit_foreign = client.post(
        f"/api/v1/campaigns/{campaign_a.id}/results",
        json={
            "metrics": {"impressions": 1000, "clicks": 50, "conversions": 10, "primary_kpi": "ROAS"},
            "lessons_learned": "Attempted foreign submission",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert submit_foreign.status_code == 404


# ==============================================================================
# 5. Synthetic Benchmark Immutability
# ==============================================================================

def test_synthetic_benchmark_is_completely_immutable(client: TestClient, db_session: Session):
    """Verify synthetic benchmark brand rejects all mutation attempts (HTTP 403)."""
    # Create synthetic benchmark brand
    synth_brand = Brand(
        name="The Taco Syndicate Benchmark",
        industry="Restaurant",
        description="Benchmark Street Tacos",
        target_audience="Austin nocturnal students",
        market_region="Austin, TX",
        brand_voice="Authentic street flavor",
        is_synthetic=True,
        hindsight_bank_id="campaignecho-brand-benchmark-taco",
    )
    db_session.add(synth_brand)
    db_session.commit()
    db_session.refresh(synth_brand)

    # Create synthetic campaign
    synth_camp = Campaign(
        brand_id=synth_brand.id,
        name="Midnight Queso Blitz",
        brief="Promote queso after 10pm",
        objective="Drive store traffic",
        platform="Instagram",
        status="COMPLETED",
        is_synthetic=True,
    )
    db_session.add(synth_camp)
    db_session.commit()
    db_session.refresh(synth_camp)

    # 0. Unauthenticated write attempts -> 401 Unauthorized (run before registering or with cleared cookies)
    client.cookies.clear()
    assert client.post(
        f"/api/v1/brands/{synth_brand.id}/memory/retain",
        json={"content": "Unauthenticated retain"},
    ).status_code == 401
    assert client.post(f"/api/v1/brands/{synth_brand.id}/memory/verify").status_code == 401
    assert client.post(f"/api/v1/brands/{synth_brand.id}/memory/provision").status_code == 401
    assert client.post(
        f"/api/v1/campaigns/{synth_camp.id}/results",
        json={"impressions": 5000, "lessons_learned": "Unauthenticated results attempt"},
    ).status_code == 401
    assert client.post(
        "/api/v1/campaigns/generate",
        json={
            "brand_id": synth_brand.id,
            "name": "Unauth Camp",
            "objective": "Awareness",
            "platform": "TikTok",
        },
    ).status_code == 401
    assert client.post(
        "/api/v1/campaigns/compare",
        json={
            "brand_id": synth_brand.id,
            "name": "Unauth Compare",
            "objective": "Awareness",
            "platform": "TikTok",
        },
    ).status_code == 401

    # Register user for authenticated tests
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": "attacker@darkweb.org", "password": "PasswordHacked123!", "full_name": "Attacker"},
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    auth_hdr = {"Authorization": f"Bearer {token}"}
    client.cookies.clear()

    # 1. Attempt to Retain directly into synthetic memory bank -> 403
    retain_res = client.post(
        f"/api/v1/brands/{synth_brand.id}/memory/retain",
        json={"content": "Attempting to pollute synthetic memory bank"},
        headers=auth_hdr,
    )
    assert retain_res.status_code == 403
    assert "immutable" in retain_res.json()["detail"].lower()

    # 2. Attempt memory verification suite on synthetic brand -> 403
    verify_res = client.post(
        f"/api/v1/brands/{synth_brand.id}/memory/verify",
        headers=auth_hdr,
    )
    assert verify_res.status_code == 403
    assert "immutable" in verify_res.json()["detail"].lower()

    # 3. Attempt bank provision/override on synthetic brand -> 403
    provision_res = client.post(
        f"/api/v1/brands/{synth_brand.id}/memory/provision",
        json={"mission": "Hostile mission override"},
        headers=auth_hdr,
    )
    assert provision_res.status_code == 403
    assert "immutable" in provision_res.json()["detail"].lower()

    # 4. Attempt to submit campaign results against synthetic campaign -> 403
    results_res = client.post(
        f"/api/v1/campaigns/{synth_camp.id}/results",
        json={
            "impressions": 5000,
            "lessons_learned": "Polluting benchmark observations",
        },
        headers=auth_hdr,
    )
    assert results_res.status_code == 403
    assert "immutable" in results_res.json()["detail"].lower()

    # 5. Attempt to generate campaign or comparison onto synthetic brand -> 403
    gen_synth_res = client.post(
        "/api/v1/campaigns/generate",
        json={
            "brand_id": synth_brand.id,
            "name": "Synthetic Mutation Attempt",
            "objective": "Awareness",
            "platform": "Instagram Reels",
        },
        headers=auth_hdr,
    )
    assert gen_synth_res.status_code == 403

    comp_synth_res = client.post(
        "/api/v1/campaigns/compare",
        json={
            "brand_id": synth_brand.id,
            "name": "Synthetic Comparison Attempt",
            "objective": "Awareness",
            "platform": "Instagram Reels",
        },
        headers=auth_hdr,
    )
    assert comp_synth_res.status_code == 403

    # 6. Attempt to update synthetic brand profile -> 403
    update_res = client.put(
        f"/api/v1/brands/{synth_brand.id}",
        json={"name": "Defaced Benchmark"},
        headers=auth_hdr,
    )
    assert update_res.status_code == 403

    # 7. Attempt to delete/archive synthetic brand profile -> 403
    delete_res = client.delete(
        f"/api/v1/brands/{synth_brand.id}",
        headers=auth_hdr,
    )
    assert delete_res.status_code == 403


# ==============================================================================
# 6. Internal Identifier Privacy
# ==============================================================================

def test_brand_responses_do_not_expose_internal_identifiers(client: TestClient, db_session: Session):
    """Verify BrandResponse and Memory telemetry never return user_id or hindsight_bank_id."""
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": "privacy_user@campaignecho.io", "password": "Password123!", "full_name": "Privacy User"},
    )
    token = reg_res.json()["access_token"]

    create_res = client.post(
        "/api/v1/brands",
        json={
            "name": "Stealth Brand",
            "industry": "Cybersecurity",
            "description": "Zero trust identity platform",
            "target_audience": "CISOs",
            "market_region": "Global",
            "brand_voice": "Technical",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_res.status_code == 201
    created_brand = create_res.json()

    # Public response MUST NOT leak user_id or hindsight_bank_id
    assert "user_id" not in created_brand
    assert "hindsight_bank_id" not in created_brand
    assert "campaignecho-brand-" not in str(created_brand)

    # List brands response MUST NOT leak them either
    list_res = client.get("/api/v1/brands", headers={"Authorization": f"Bearer {token}"})
    assert list_res.status_code == 200
    for b in list_res.json():
        assert "user_id" not in b
        assert "hindsight_bank_id" not in b
        assert "campaignecho-brand-" not in str(b)


# ==============================================================================
# 7. CSRF Origin Validation, Auth Rate Limiting & Complete Ownership Checks
# ==============================================================================

def test_csrf_untrusted_origin_is_rejected(client: TestClient):
    """Verify state-changing requests with an untrusted Origin header are blocked with 403."""
    res = client.post(
        "/api/v1/auth/logout",
        headers={"Origin": "https://evil-attacker.example.com"},
    )
    assert res.status_code == 403
    assert "csrf" in res.json()["detail"].lower()


def test_auth_rate_limiting_enforced(client: TestClient):
    """Verify excessive repeated login/register bursts trigger HTTP 429 Too Many Requests."""
    hit_429 = False
    for i in range(35):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "nonexistent@campaignecho.io", "password": "WrongPassword123!"},
        )
        if res.status_code == 429:
            hit_429 = True
            break
    assert hit_429 is True


def test_unauthenticated_and_foreign_campaign_endpoints_blocked(client: TestClient, db_session: Session):
    """Verify every campaign endpoint enforces authentication and tenant ownership."""
    # User A & Brand A
    reg_a = client.post(
        "/api/v1/auth/register",
        json={"email": "owner_a@campaignecho.io", "password": "Password123!", "full_name": "Owner A"},
    )
    token_a = reg_a.json()["access_token"]
    brand_a = client.post(
        "/api/v1/brands",
        json={
            "name": "Owner A Brand",
            "industry": "Tech",
            "description": "Cloud tech",
            "target_audience": "CTOs",
            "market_region": "US",
            "brand_voice": "Crisp",
        },
        headers={"Authorization": f"Bearer {token_a}"},
    ).json()

    # User B
    reg_b = client.post(
        "/api/v1/auth/register",
        json={"email": "attacker_b@campaignecho.io", "password": "Password123!", "full_name": "Attacker B"},
    )
    token_b = reg_b.json()["access_token"]

    # Foreign User B attempting to generate campaign on Brand A -> 404
    gen_res = client.post(
        "/api/v1/campaigns/generate",
        json={
            "brand_id": brand_a["id"],
            "name": "Foreign Gen",
            "objective": "Awareness",
            "platform": "TikTok",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert gen_res.status_code == 404

    # Foreign User B attempting to run comparison on Brand A -> 404
    comp_res = client.post(
        "/api/v1/campaigns/compare",
        json={
            "brand_id": brand_a["id"],
            "name": "Foreign Compare",
            "objective": "Awareness",
            "platform": "TikTok",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert comp_res.status_code == 404

    # Foreign User B attempting to list Brand A's campaigns -> 404
    list_res = client.get(
        f"/api/v1/campaigns?brand_id={brand_a['id']}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert list_res.status_code == 404


# ==============================================================================
# 8. Alembic Single Head, Migration Continuity & SQLite Foreign Key Enforcement
# ==============================================================================

def test_alembic_single_head_fresh_migration_and_fk_pragma(tmp_path):
    """Verify Alembic maintains a single head, migrates fresh DBs cleanly, and enforces SQLite FKs."""
    from pathlib import Path
    from alembic import command
    from alembic.config import Config
    from alembic.script import ScriptDirectory
    from sqlalchemy import create_engine, inspect, text
    from backend.app.db.session import engine as app_engine

    root_dir = Path(__file__).resolve().parents[2]
    alembic_ini = root_dir / "alembic.ini"
    fresh_db = tmp_path / "fresh_alembic.db"

    cfg = Config(str(alembic_ini))
    cfg.set_main_option("sqlalchemy.url", f"sqlite:///{fresh_db.as_posix()}")

    script = ScriptDirectory.from_config(cfg)
    heads = script.get_heads()
    assert len(heads) == 1
    assert heads[0] == "b48f93dd6d91"

    command.upgrade(cfg, "head")

    test_engine = create_engine(f"sqlite:///{fresh_db.as_posix()}")
    inspector = inspect(test_engine)
    tables = set(inspector.get_table_names())
    expected_tables = {
        "users",
        "user_sessions",
        "brands",
        "campaigns",
        "campaign_metrics",
        "campaign_feedback",
        "campaign_comparisons",
        "memory_logs",
        "memory_verification_runs",
        "alembic_version",
    }
    assert expected_tables.issubset(tables)
    test_engine.dispose()

    # Verify application SQLite engine enforces PRAGMA foreign_keys = ON
    with app_engine.connect() as conn:
        if app_engine.dialect.name == "sqlite":
            fk_status = conn.execute(text("PRAGMA foreign_keys")).scalar()
            assert fk_status == 1


def test_alembic_upgrade_from_m8_revision_preserves_data(tmp_path):
    """Verify upgrading an M8 DB (e71b29a1b023 -> b48f93dd6d91) adds user_sessions without data loss."""
    from pathlib import Path
    from alembic import command
    from alembic.config import Config
    from sqlalchemy import create_engine, inspect, text

    root_dir = Path(__file__).resolve().parents[2]
    alembic_ini = root_dir / "alembic.ini"
    m8_db = tmp_path / "m8_snapshot.db"

    cfg = Config(str(alembic_ini))
    cfg.set_main_option("sqlalchemy.url", f"sqlite:///{m8_db.as_posix()}")

    # Initialize database at M8 revision before M8.1 user_sessions migration
    command.upgrade(cfg, "e71b29a1b023")

    eng = create_engine(f"sqlite:///{m8_db.as_posix()}")
    with eng.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO users (id, email, hashed_password, full_name, is_active, created_at, updated_at) "
                "VALUES ('u-mig-1', 'mig@campaignecho.io', 'hash', 'Mig User', 1, '2026-11-08 00:00:00', '2026-11-08 00:00:00')"
            )
        )
        conn.execute(
            text(
                "INSERT INTO brands (id, user_id, name, industry, description, target_audience, market_region, brand_voice, preferred_language, is_synthetic, is_archived, created_at, updated_at) "
                "VALUES ('b-mig-1', 'u-mig-1', 'Migration Brand', 'Tech', 'Desc', 'Devs', 'US', 'Clear', 'en', 0, 0, '2026-11-08 00:00:00', '2026-11-08 00:00:00')"
            )
        )
    eng.dispose()

    # Upgrade to M8.1 head
    command.upgrade(cfg, "head")

    eng_after = create_engine(f"sqlite:///{m8_db.as_posix()}")
    inspector = inspect(eng_after)
    assert "user_sessions" in inspector.get_table_names()
    session_cols = {c["name"] for c in inspector.get_columns("user_sessions")}
    assert {"id", "user_id", "token_hash", "created_at", "expires_at", "revoked_at"}.issubset(session_cols)

    with eng_after.connect() as conn:
        user_row = conn.execute(text("SELECT email FROM users WHERE id = 'u-mig-1'")).fetchone()
        brand_row = conn.execute(text("SELECT name FROM brands WHERE id = 'b-mig-1'")).fetchone()
        assert user_row is not None and user_row[0] == "mig@campaignecho.io"
        assert brand_row is not None and brand_row[0] == "Migration Brand"
    eng_after.dispose()

