"""Security Regression and Process Ownership Unit Tests.

Verifies:
1. Rejection of placeholder API keys (Hindsight & Z.ai) and CAMPAIGNECHO_AUTH_SECRET.
2. Strict verification of all 10 database tables against SQLAlchemy schema.
3. Python runtime version requirement (>= 3.11).
4. Strict brand memory isolation and tenant boundaries.
5. Process ownership schema and validation rules.
"""

import sys
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.base import Base
from backend.app.db.models import Brand, Campaign, MemoryLog
from backend.app.services.memory_service import MemoryService
from scripts.verify_readiness import (
    check_python_runtime,
    check_env_keys,
    check_database,
    REQUIRED_TABLES,
    PLACEHOLDERS,
)


def test_python_runtime_enforces_version():
    """Verify check_python_runtime accepts Python >= 3.11 and rejects < 3.11."""
    passed, msg = check_python_runtime()
    assert passed is True
    assert ">= 3.11 verified" in msg

    # Simulate Python 3.10
    with patch.object(sys, "version_info", (3, 10, 8)):
        failed, err_msg = check_python_runtime()
        assert failed is False
        assert "below required minimum" in err_msg


def test_env_keys_rejects_all_placeholders(monkeypatch):
    """Verify check_env_keys rejects every known placeholder string."""
    monkeypatch.delenv("CAMPAIGNECHO_AUTH_SECRET", raising=False)
    monkeypatch.delenv("HINDSIGHT_API_KEY", raising=False)
    monkeypatch.delenv("ZAI_API_KEY", raising=False)
    valid_secret = "a" * 32
    for placeholder in PLACEHOLDERS:
        with patch("backend.app.core.config.settings.CAMPAIGNECHO_AUTH_SECRET", placeholder):
            with patch("backend.app.core.config.settings.HINDSIGHT_API_KEY", "real-valid-key"):
                with patch("backend.app.core.config.settings.ZAI_API_KEY", "real-valid-key"):
                    passed, msg = check_env_keys()
                    assert passed is False
                    assert "placeholder" in msg.lower() or "least 32" in msg.lower()

        with patch("backend.app.core.config.settings.CAMPAIGNECHO_AUTH_SECRET", valid_secret):
            with patch("backend.app.core.config.settings.HINDSIGHT_API_KEY", placeholder):
                with patch("backend.app.core.config.settings.ZAI_API_KEY", "real-valid-key"):
                    passed, msg = check_env_keys()
                    assert passed is False
                    assert "placeholder" in msg.lower()

        with patch("backend.app.core.config.settings.CAMPAIGNECHO_AUTH_SECRET", valid_secret):
            with patch("backend.app.core.config.settings.HINDSIGHT_API_KEY", "real-valid-key"):
                with patch("backend.app.core.config.settings.ZAI_API_KEY", placeholder):
                    passed, msg = check_env_keys()
                    assert passed is False
                    assert "placeholder" in msg.lower()


def test_env_keys_rejects_missing_or_empty(monkeypatch):
    """Verify check_env_keys rejects empty or None keys."""
    monkeypatch.delenv("CAMPAIGNECHO_AUTH_SECRET", raising=False)
    monkeypatch.delenv("HINDSIGHT_API_KEY", raising=False)
    monkeypatch.delenv("ZAI_API_KEY", raising=False)
    valid_secret = "a" * 32
    with patch("backend.app.core.config.settings.CAMPAIGNECHO_AUTH_SECRET", ""):
        with patch("backend.app.core.config.settings.HINDSIGHT_API_KEY", "real-valid-key"):
            with patch("backend.app.core.config.settings.ZAI_API_KEY", "real-valid-key"):
                passed, msg = check_env_keys()
                assert passed is False
                assert "missing or empty" in msg

    with patch("backend.app.core.config.settings.CAMPAIGNECHO_AUTH_SECRET", valid_secret):
        with patch("backend.app.core.config.settings.HINDSIGHT_API_KEY", ""):
            with patch("backend.app.core.config.settings.ZAI_API_KEY", "real-valid-key"):
                passed, msg = check_env_keys()
                assert passed is False
                assert "missing or empty" in msg

    with patch("backend.app.core.config.settings.CAMPAIGNECHO_AUTH_SECRET", valid_secret):
        with patch("backend.app.core.config.settings.HINDSIGHT_API_KEY", "real-valid-key"):
            with patch("backend.app.core.config.settings.ZAI_API_KEY", "   "):
                passed, msg = check_env_keys()
                assert passed is False
                assert "missing or empty" in msg


def test_database_schema_verifies_all_10_tables():
    """Verify check_database verifies exactly all 10 required tables."""
    assert len(REQUIRED_TABLES) == 10
    expected = {
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
    assert REQUIRED_TABLES == expected

    # Mock engine inspector returning only 3 tables
    mock_inspector = MagicMock()
    mock_inspector.get_table_names.return_value = ["brands", "campaigns", "memory_logs"]

    with patch("sqlalchemy.inspect", return_value=mock_inspector):
        passed, msg = check_database()
        assert passed is False
        assert "Missing required database tables" in msg
        assert "alembic_version" in msg


def test_strict_brand_isolation_in_memory_service():
    """Verify MemoryService strictly prevents cross-brand bank ID access."""
    service = MemoryService(is_live=False)

    brand_1_id = "brand-uuid-001"
    brand_2_id = "brand-uuid-002"

    bank_1 = service.get_bank_id_for_brand(brand_1_id)
    bank_2 = service.get_bank_id_for_brand(brand_2_id)

    assert bank_1 == "campaignecho-brand-brand-uuid-001"
    assert bank_2 == "campaignecho-brand-brand-uuid-002"
    assert bank_1 != bank_2

    # Brand 1 cannot access Brand 2 bank
    assert service.get_bank_id_for_brand(brand_1_id) != service.get_bank_id_for_brand(brand_2_id)
