"""CampaignEcho - Deep System, Runtime & API Readiness Verifier.

Truthfully verifies:
1. Python runtime (>= 3.11)
2. Node.js runtime (>= 20)
3. Frontend package installation and dependencies
4. Database connectivity and all 8 SQLAlchemy schema tables
5. API credentials (non-empty, non-placeholder, secure handling)
6. Live Vectorize Hindsight Cloud authentication (via SDK)
7. Live Z.ai BigModel API authentication (via HTTP GET /models)

Returns exit code 0 if all mandatory checks pass, 1 if any fail.
"""
import sys
import asyncio
import os
import subprocess
from typing import Dict, Any, List, Tuple
from pathlib import Path
import httpx

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

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

REQUIRED_TABLES = {
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


def check_python_runtime() -> Tuple[bool, str]:
    major, minor, micro = sys.version_info[:3]
    version_str = f"{major}.{minor}.{micro}"
    if sys.version_info < (3, 11):
        return False, f"Python {version_str} is below required minimum (>= 3.11)"
    return True, f"Python {version_str} (>= 3.11 verified)"


def check_node_runtime() -> Tuple[bool, str]:
    try:
        proc = subprocess.run(
            ["node", "-v"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        if proc.returncode != 0:
            return False, f"node -v failed with exit code {proc.returncode}"
        version_raw = proc.stdout.strip()
        # Expect format v20.x.x
        if not version_raw.startswith("v"):
            return False, f"Unrecognized Node.js version output: '{version_raw}'"
        major = int(version_raw[1:].split(".")[0])
        if major < 20:
            return False, f"Node.js {version_raw} is below required minimum (>= 20)"
        return True, f"Node.js {version_raw} (>= 20 verified)"
    except FileNotFoundError:
        return False, "Node.js executable ('node') not found in PATH"
    except Exception as exc:
        return False, f"Node.js check failed: {exc}"


def check_frontend_dependencies() -> Tuple[bool, str]:
    frontend_dir = ROOT_DIR / "frontend"
    node_modules = frontend_dir / "node_modules"
    if not node_modules.is_dir():
        return False, "frontend/node_modules directory missing. Run 'npm install' in frontend."

    # Verify critical dependencies are present in node_modules
    core_pkgs = ["next", "react", "lucide-react", "tailwindcss"]
    missing_pkgs = [p for p in core_pkgs if not (node_modules / p).exists()]
    if missing_pkgs:
        return False, f"Missing critical npm packages: {', '.join(missing_pkgs)}"

    return True, f"frontend/node_modules verified (all critical packages present)"


def check_env_keys() -> Tuple[bool, str]:
    from backend.app.core.config import settings

    auth_secret = (settings.CAMPAIGNECHO_AUTH_SECRET or os.environ.get("CAMPAIGNECHO_AUTH_SECRET") or "").strip()
    if not auth_secret:
        return False, "CAMPAIGNECHO_AUTH_SECRET is missing or empty"
    if len(auth_secret) < 32:
        return False, f"CAMPAIGNECHO_AUTH_SECRET must be at least 32 characters (got {len(auth_secret)})"
    if any(p in auth_secret.lower() for p in PLACEHOLDERS):
        return False, "CAMPAIGNECHO_AUTH_SECRET contains a placeholder value"

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

    return True, "API keys and auth secret configured and verified non-placeholder (secrets masked)"


def check_database() -> Tuple[bool, str]:
    try:
        from backend.app.db.session import engine
        from sqlalchemy import text, inspect

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())
        missing = REQUIRED_TABLES - tables
        if missing:
            return False, (
                f"Missing required database tables ({len(missing)} missing: "
                f"{', '.join(sorted(missing))}). Run 'alembic upgrade head'."
            )
        return True, (
            f"{len(REQUIRED_TABLES)}/{len(REQUIRED_TABLES)} required database tables verified: "
            f"{', '.join(sorted(REQUIRED_TABLES))}"
        )
    except Exception as exc:
        return False, f"Database connectivity/schema check failed: {exc}"


async def check_hindsight_cloud() -> Tuple[bool, str]:
    try:
        from backend.app.services.memory_service import MemoryService
        ms = MemoryService()
        is_live, status, version = await ms.check_engine_health()
        try:
            if hasattr(ms, "_client") and hasattr(ms._client, "aclose"):
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


async def main_async() -> int:
    print("=" * 60)
    print("  CampaignEcho - System, Runtime & Cloud Readiness Diagnostic")
    print("=" * 60)

    checks = [
        ("Python Runtime (>= 3.11)", check_python_runtime()),
        ("Node.js Runtime (>= 20)", check_node_runtime()),
        ("Frontend npm Dependencies", check_frontend_dependencies()),
        ("API Configuration Keys", check_env_keys()),
        ("SQLite Database Schema", check_database()),
    ]

    all_passed = True

    for name, (passed, msg) in checks:
        status_tag = "[OK]  " if passed else "[FAIL]"
        print(f" {status_tag} {name}: {msg}")
        if not passed:
            all_passed = False

    # Async external network checks only if config keys pass
    if all_passed:
        hindsight_passed, hindsight_msg = await check_hindsight_cloud()
        status_tag = "[OK]  " if hindsight_passed else "[FAIL]"
        print(f" {status_tag} Vectorize Hindsight Cloud: {hindsight_msg}")
        if not hindsight_passed:
            all_passed = False

        zai_passed, zai_msg = await check_zai_gateway()
        status_tag = "[OK]  " if zai_passed else "[FAIL]"
        print(f" {status_tag} Z.ai BigModel API Gateway: {zai_msg}")
        if not zai_passed:
            all_passed = False
    else:
        print(" [SKIP] External cloud API checks skipped due to earlier prerequisite failures.")

    print("=" * 60)
    if all_passed:
        print("  VERDICT: ALL READINESS CRITERIA VERIFIED (Exit Code 0)")
        print("=" * 60)
        return 0
    else:
        print("  VERDICT: ONE OR MORE CHECKS FAILED (Exit Code 1)")
        print("=" * 60)
        return 1


def main() -> int:
    return asyncio.run(main_async())


if __name__ == "__main__":
    sys.exit(main())
