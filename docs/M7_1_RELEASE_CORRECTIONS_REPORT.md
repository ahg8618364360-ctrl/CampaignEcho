# Milestone 7.1: Release Corrections & Re-certification Report

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Target Category**: AI Agents That Learn Using Hindsight (Vectorize Hindsight)  
**Date**: November 8, 2026 — 08:55 IST  
**Status**: MILESTONE 7.1 COMPLETE — ALL INDEPENDENT REVIEW DEFECTS RESOLVED  
**Branch**: `feature/m7-final-release`  
**Base Commit**: `1ed8e56392c55111e8e966347cb0c371af21b3ae`  
**Repository**: `https://github.com/ahg8618364360-ctrl/CampaignEcho`  

---

## 1. Executive Summary

Following an independent release audit of Milestone 7, five mandatory engineering defects and several competition compliance gaps were identified. In strict accordance with CampaignEcho's core laws of **Verification Before Claims** and **Zero False Reporting**, Milestone 7.1 resolves every identified issue:

1. **GitHub Actions Backend CI Defect Resolved**: Resolved the setuptools flat-layout discovery failure (`Multiple top-level packages discovered: ['backend', 'frontend']`) by adding explicit package discovery rules and project dependencies to `pyproject.toml`. Verified that `pip install -e .` and backend tests execute with 100% success.
2. **Readiness Script Hardened (`check-demo.ps1`)**: Eliminated permissive catch blocks that previously masked network failures. Implemented `scripts/verify_readiness.py`, which rejects known placeholder API keys, validates database schema, and performs genuine authenticated calls against Vectorize Hindsight Cloud (`aget_version`) and Z.ai API (`GET /models`). Returns exit code 1 on any failure.
3. **Startup Script Hardened (`start-demo.ps1`)**: Halts immediately on pre-flight diagnostic failure. Enforces checks on Alembic migration exit codes. Verifies backend HTTP 200 `/health/ready` and frontend HTTP 200 before claiming servers are online. Records structured process ownership metadata in `scripts/demo-ownership.json`.
4. **Shutdown Script Hardened (`stop-demo.ps1`)**: Replaced blind PID termination with deep WMI/CIM process verification (`Stop-VerifiedProcess`). Validates command line and executable paths (`uvicorn`, `backend.app.main`, `next`, `node`) before issuing stop signals. Safely refuses to touch stale or reused PIDs belonging to other applications.
5. **Seeder Hardened Against Brand Collisions (`seed_demo.py`)**: Added strict provenance checks refusing to inject synthetic demo fixtures into an existing authentic brand (`is_synthetic = False`). Added comprehensive unit tests in `backend/tests/test_seed_demo.py` verifying idempotency, collision refusal, and synthetic provenance tags.
6. **Factual & Submission Compliance Aligned**:
   - Explicitly disclosed that *The Taco Syndicate* and its metrics are synthetic evaluation fixtures, while Hindsight Cloud and Z.ai operations are real live cloud operations.
   - Accurately mapped competition forms: Form 1 (Individual Profile Review, submitted by each member) and Form 2 (Final Team Project Submission, submitted once by the team lead).
   - Corrected publishing obligations to track 1 article, 1 LinkedIn post, and 1 Reddit post per member.
   - Accurately declared Band AI Desktop status as `PENDING` member desktop installation.

---

## 2. Detailed Engineering Corrections

### A. Repair GitHub Actions Backend CI
- **Defect**: CI step `pip install -e .` failed because setuptools discovered both `backend` and `frontend` in the project root flat layout.
- **Root Cause**: Missing package discovery directives in `pyproject.toml`.
- **Resolution**:
  - Configured `[tool.setuptools.packages.find]` in `pyproject.toml`:
    ```toml
    [tool.setuptools.packages.find]
    where = ["."]
    include = ["backend*"]
    exclude = ["frontend*", "scratch*"]
    ```
  - Declared explicit dependencies in `pyproject.toml` including `hindsight-client>=1.2.0`, `fastapi`, `sqlalchemy`, `alembic`, `pydantic-settings`, and `httpx`.
  - Updated `backend/requirements.txt` to maintain parity.
  - Updated `.github/workflows/ci.yml` to install with `pip install -e ".[test]"`.
- **Verification**: `pip install -e .` succeeded locally with code 0. CI pytest command passed 36 unit tests with 6 live tests deselected.

### B. Repair `scripts/check-demo.ps1`
- **Defect**: Permissive catch blocks printed `[ONLINE]` or `[REACHABLE]` even when HTTP requests failed. Placeholder API keys passed validation. Non-zero exit codes were omitted.
- **Resolution**:
  - Created `scripts/verify_readiness.py`:
    * Rejects placeholder strings (`your_hindsight_api_key_here`, `your_zai_api_key_here`, `sk-placeholder`, `xxxx`, empty).
    * Validates all 8 SQLite database tables exist via SQLAlchemy inspection.
    * Executes real `MemoryService.check_engine_health()` (`aget_version`), checking for `CONNECTED`, `AUTH_FAILED`, or `UNREACHABLE`.
    * Executes real authenticated call to Z.ai Inference Gateway (`GET /models`), checking for HTTP 200 vs 401/403.
    * Returns exit code 0 if all pass, 1 if any fail.
  - Rewrote `scripts/check-demo.ps1` to invoke `verify_readiness.py` and enforce `exit 1` on any failure.
- **Verification**: Tested positive path (exit code 0) and negative path with placeholder key (exit code 1).

### C. Repair `scripts/start-demo.ps1`
- **Defect**: Did not halt on diagnostic failure. Swallowed Alembic migration exit codes. Claimed startup success before servers became healthy.
- **Resolution**:
  - Added strict diagnostic gate: `if ($LASTEXITCODE -ne 0) { exit 1 }`.
  - Added migration gate: checks `$alembicExe ... upgrade head` exit code; halts on failure.
  - Added active readiness polling: polls `http://127.0.0.1:8000/api/v1/health/ready` for up to 20 seconds; terminates and halts if unhealthy.
  - Added active frontend polling: polls `http://localhost:3000` for up to 25 seconds for HTTP 200; builds `.next` if missing.
  - Writes structured ownership metadata (`scripts/demo-ownership.json`) tracking PIDs, ports, and verified command lines.
- **Verification**: Verified cold start and warm start; validated `scripts/demo-ownership.json`.

### D. Repair `scripts/stop-demo.ps1`
- **Defect**: Forcefully killed recorded PIDs without verifying process identity, risking termination of unrelated applications if PIDs were reused by the OS.
- **Resolution**:
  - Implemented `Stop-VerifiedProcess`:
    * Uses `Get-CimInstance Win32_Process` to inspect the process name and command line.
    * Validates pattern `uvicorn|backend\.app\.main|CampaignEcho` for backend.
    * Validates pattern `next|node|frontend|cmd\.exe` for frontend.
    * Traverses and terminates child processes safely.
    * If process identity does not match, **refuses to kill** and outputs a warning.
  - Cleans up tracking files only after verified shutdown.
- **Verification**: Verified clean shutdown of both servers; ports 8000 and 3000 freed.

### E. Harden `scripts/seed_demo.py`
- **Defect**: Reused brand solely by name "The Taco Syndicate", risking injecting synthetic fixtures into an authentic user brand.
- **Resolution**:
  - Checks `brand.is_synthetic`. If a brand exists with the same name but `is_synthetic = False`, raises `ValueError` and aborts without database modification.
  - Enforces `is_synthetic = True` on all seeded campaigns.
  - Enforces `retained_to_hindsight = False` and `[SYNTHETIC DEMO FIXTURE]` tag on feedback.
  - Added automated unit tests in `backend/tests/test_seed_demo.py`:
    * `test_seed_demo_idempotency`
    * `test_seed_demo_refuses_non_synthetic_brand_collision`
    * `test_seed_demo_synthetic_provenance`
- **Verification**: All 3 tests passed with code 0.

---

## 3. Factual & Competition Alignment

| Item | Previous State | Corrected State in M7.1 |
| :--- | :--- | :--- |
| **Synthetic Data** | Described in places as "actual customer performance" | Explicitly labeled as synthetic demonstration fixtures (`is_synthetic = True`). Real cloud operations distinguished from sample data. |
| **Publishing Statuses** | Marked draft links as active URLs | Explicitly tagged with `READY_TO_PUBLISH` or `PENDING_PUBLICATION`. Placeholder URLs clearly noted. |
| **Individual Publishing** | Distributed 1 article, 1 video, 1 LinkedIn post across 3 people | Correctly tracked: Every participant must independently publish 1 article, 1 LinkedIn post, and 1 Reddit post. Team video is shared. |
| **Google Forms** | Instructed all members to submit project form | Clarified: Form 1 (Individual Profile Review) submitted by all; Form 2 (Final Project) submitted once by team lead. |
| **Band AI Desktop** | Documented setup without status clarity | Truthfully reported as `PENDING` participant confirmation before final form submission. |
| **Causal Claims** | Implied proof of uplift | Clarified: Persistent memory provides qualitative grounding and error avoidance; does not establish causal uplift. |

---

## 4. Re-Verification Summary

- **Backend Pytest Suite**: **42 passed, 0 failed, 0 warnings** (includes 5 live cloud integration tests, 1 live E2E test, 3 seeder safety tests).
- **Frontend Quality**: `npm run typecheck` exits with 0 errors; `npm run lint` exits with 0 warnings/errors; `npm run build` compiles 11 routes cleanly.
- **Automation Scripts**: `check-demo.ps1`, `start-demo.ps1`, and `stop-demo.ps1` verified on Windows 11 host with true exit codes.
- **Prohibited Words**: Regex scan confirmed 0 occurrences across all submission files.
- **Article Standards**: 1,480 words, 8-word title, 0 banned words.

Detailed execution proof is documented in [`docs/RELEASE_EVIDENCE.md`](file:///c:/CampaignEcho/docs/RELEASE_EVIDENCE.md).

---

## 5. Status & Next Action

Milestone 7.1 is **READY FOR PUSH AND PULL REQUEST CREATION**.  
Commit changes to `feature/m7-final-release`, push to origin, verify CI pipeline execution on GitHub, and open the Pull Request into `main`.
