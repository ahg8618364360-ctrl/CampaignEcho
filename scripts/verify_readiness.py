"""CampaignEcho - Deep System & API Readiness Verifier.

Truthfully verifies environment variables, database schema,
Vectorize Hindsight Cloud authentication, and Z.ai API gateway.
Returns exit code 0 if all mandatory checks pass, 1 if any fail.
"""
import sys
import asyncio
import os
from typing import Dict, Any, List, Tuple
import httpx

# Reject known placeholder strings
PLACEHOLDERS = [
    "your_hindsight_api_key_here",
    "your_zai_api_key_here",
    "your_api_key_here",
    "your_groq_api_key_here",
    "sk-placeholder",
    "placeholder",
    "xxxx",
    "todo",
]


def check_env_keys() -> Tuple[bool, str]:
    from backend.app.core.config import settings

    hindsight_key = (settings.HINDSIGHT_API_KEY or "").strip()
    zai_key = (settings.ZAI_API_KEY or "").strip()

    if not hindsight_key:
        return False, "HINDSIGHT_API_KEY is missing or empty"
    if any(p in hindsight_key.lower() for p in PLACEHOLDERS):
        return False, "HINDSIGHT_API_KEY contains a placeholder value"

    if not zai_key:
        return False, "ZAI_API_KEY is missing or empty"
    if any(p in zai_key.lower() for p in PLACEHOLDERS):
        return False, "ZAI_API_KEY contains a placeholder value"

    return True, "API keys configured and non-placeholder"


def check_database() -> Tuple[bool, str]:
    try:
        from backend.app.db.session import engine
        from sqlalchemy import text, inspect

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        required = {"brands", "campaigns", "memory_logs"}
        missing = required - set(tables)
        if missing:
            return False, f"Missing required database tables: {missing}. Run migrations."
        return True, f"SQLite connected; verified tables: {', '.join(sorted(tables))}"
    except Exception as exc:
        return False, f"Database check failed: {exc}"


async def check_hindsight_cloud() -> Tuple[bool, str]:
    try:
        from backend.app.services.memory_service import MemoryService
        ms = MemoryService()
        is_live, status, version = await ms.check_engine_health()
        try:
            await ms._client.aclose()
        except Exception:
            pass
        if is_live and status == "CONNECTED":
            return True, f"CONNECTED (v{version}) at {ms.base_url}"
        elif status == "AUTH_FAILED":
            return False, f"AUTH_FAILED (Invalid HINDSIGHT_API_KEY) at {ms.base_url}"
        else:
            return False, f"UNREACHABLE ({status}) at {ms.base_url}"
    except Exception as exc:
        return False, f"Hindsight check exception: {exc}"


async def check_zai_gateway() -> Tuple[bool, str]:
    try:
        from backend.app.core.config import settings
        url = f"{settings.effective_zai_url}/models"
        headers = {"Authorization": f"Bearer {settings.ZAI_API_KEY}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("id") for m in data.get("data", [])][:3]
                return True, f"CONNECTED (HTTP 200; available models: {', '.join(models)})"
            elif resp.status_code in (401, 403):
                return False, f"AUTH_FAILED (HTTP {resp.status_code}: Invalid ZAI_API_KEY)"
            else:
                return False, f"HTTP_ERROR (HTTP {resp.status_code}: {resp.text[:80]})"
    except httpx.ConnectTimeout:
        return False, "CONNECTION_TIMEOUT (Z.ai gateway unreachable within 10s)"
    except httpx.ConnectError as ce:
        return False, f"CONNECT_ERROR ({ce})"
    except Exception as exc:
        return False, f"Z.ai check exception: {exc}"


async def run_all_checks() -> int:
    from typing import Tuple
    print("=" * 60)
    print("  CampaignEcho — Genuine Verification Diagnostic")
    print("=" * 60)

    all_passed = True

    # 1. Environment Keys
    print("\n[Check 1/4] Environment Key Validation...")
    ok, msg = check_env_keys()
    if ok:
        print(f"  --> PASS: {msg}")
    else:
        print(f"  --> FAIL: {msg}")
        all_passed = False

    # 2. Database & Schema
    print("\n[Check 2/4] Database & Schema Verification...")
    ok, msg = check_database()
    if ok:
        print(f"  --> PASS: {msg}")
    else:
        print(f"  --> FAIL: {msg}")
        all_passed = False

    # 3. Vectorize Hindsight Cloud
    print("\n[Check 3/4] Vectorize Hindsight Cloud Authentication...")
    ok, msg = await check_hindsight_cloud()
    if ok:
        print(f"  --> PASS: {msg}")
    else:
        print(f"  --> FAIL: {msg}")
        all_passed = False

    # 4. Z.ai Inference Gateway
    print("\n[Check 4/4] Z.ai BigModel API Authentication...")
    ok, msg = await check_zai_gateway()
    if ok:
        print(f"  --> PASS: {msg}")
    else:
        print(f"  --> FAIL: {msg}")
        all_passed = False

    print("\n" + "=" * 60)
    if all_passed:
        print("  VERIFICATION RESULT: ALL MANDATORY CHECKS PASSED")
        print("=" * 60)
        return 0
    else:
        print("  VERIFICATION RESULT: ONE OR MORE MANDATORY CHECKS FAILED")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    from typing import Tuple
    exit_code = asyncio.run(run_all_checks())
    sys.exit(exit_code)
