# CampaignEcho — Release Evidence & Verification Ledger

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Target Category**: AI Agents That Learn Using Hindsight (Vectorize Hindsight)  
**Date**: November 8, 2026 — 08:50 IST  
**Branch**: `feature/m7-final-release`  
**Classification Standard**:
- **VERIFIED**: Independently observed successful execution in local environment with output recorded.
- **REPORTED**: Result supplied by an earlier execution log.
- **PENDING**: Requires external human action or platform publication.
- **BLOCKED**: Failed verification or unmet mandatory prerequisite.

---

## 1. Automated Test Suite Evidence

### Full Pytest Suite (Unit, Integration & Seeder Tests)
- **Command**: `.\venv\Scripts\pytest.exe -v --tb=short backend/tests`
- **Classification**: **VERIFIED**
- **Execution Date**: November 8, 2026
- **Result**: **42 passed in 172.4s (0 warnings, 0 failures, 0 skipped)**
- **Evidence Breakdown**:
  1. `test_campaigns.py::test_campaign_generation_endpoint` -> **PASSED**
  2. `test_campaigns.py::test_campaign_results_submission_closes_loop` -> **PASSED**
  3. `test_comparison_unit.py::test_comparison_endpoint_flow` -> **PASSED**
  4. `test_comparison_unit.py::test_comparison_rejects_hallucinated_citations` -> **PASSED**
  5. `test_comparison_unit.py::test_comparison_brand_not_found` -> **PASSED**
  6. `test_comparison_unit.py::test_comparison_mode_a_never_calls_hindsight` -> **PASSED**
  7. `test_health.py::test_health_live` -> **PASSED**
  8. `test_health.py::test_health_ready_success` -> **PASSED**
  9. `test_health.py::test_health_ready_database_failure` -> **PASSED**
  10. `test_health.py::test_cors_headers` -> **PASSED**
  11. `test_live_learning_e2e.py::test_live_continuous_learning_loop_e2e` -> **PASSED** (Exercised live Hindsight `arecall` + `areflect` -> Z.ai GLM-4.5-Flash -> SQLite -> Results ingestion -> Hindsight `aretain` -> Fresh session recall)
  12. `test_memory_integration.py::test_critical_1_real_retain` -> **PASSED** (Real Vectorize Hindsight Cloud `aretain`)
  13. `test_memory_integration.py::test_critical_2_real_recall` -> **PASSED** (Real Vectorize Hindsight Cloud `arecall`)
  14. `test_memory_integration.py::test_critical_3_real_reflect` -> **PASSED** (Real Vectorize Hindsight Cloud `areflect`)
  15. `test_memory_integration.py::test_critical_4_cross_session_persistence` -> **PASSED**
  16. `test_memory_integration.py::test_critical_5_strict_brand_isolation` -> **PASSED** (Verified Brand B cannot query Brand A bank)
  17. `test_memory_unit.py::test_bank_provisioning_idempotency` -> **PASSED**
  18. `test_memory_unit.py::test_memory_retain_success` -> **PASSED**
  19. `test_memory_unit.py::test_memory_recall_success` -> **PASSED**
  20. `test_memory_unit.py::test_memory_reflect_success` -> **PASSED**
  21-31. Regression tests A through K -> **11 PASSED**
  32. `test_memory_status_unauthenticated_state` -> **PASSED**
  33. `test_memory_activity_telemetry` -> **PASSED**
  34. `test_brand_isolation_boundary` -> **PASSED**
  35. `test_nonexistent_brand_returns_404` -> **PASSED**
  36. `test_hindsight_unreachable_error_handling` -> **PASSED**
  37. `test_models.py::test_brand_creation_and_synthetic_flag` -> **PASSED**
  38. `test_models.py::test_campaign_metrics_decimal_and_nullable` -> **PASSED**
  39. `test_models.py::test_cascade_deletion` -> **PASSED**
  40. `test_seed_demo.py::test_seed_demo_idempotency` -> **PASSED**
  41. `test_seed_demo.py::test_seed_demo_refuses_non_synthetic_brand_collision` -> **PASSED** (Safely aborts when brand has `is_synthetic = False`)
  42. `test_seed_demo.py::test_seed_demo_synthetic_provenance` -> **PASSED** (All fixtures marked `is_synthetic = True`, feedback `retained_to_hindsight = False`)

---

## 2. CI Pipeline & Packaging Evidence

### Setuptools Package Discovery Fix
- **Command**: `.\venv\Scripts\python.exe -m pip install -e .`
- **Classification**: **VERIFIED**
- **Result**: **Exit code 0** (Installed `campaignecho-0.1.0` in editable mode).
- **Configuration**:
  ```toml
  [tool.setuptools.packages.find]
  where = ["."]
  include = ["backend*"]
  exclude = ["frontend*", "scratch*"]
  ```

### CI Test Runner Equivalent
- **Command**: `pytest backend/tests/ -v -k "not test_critical_ and not test_live_continuous_learning_loop_e2e"`
- **Classification**: **VERIFIED**
- **Result**: **36 passed, 6 deselected in 1.12s** (Zero failures).

---

## 3. Frontend Quality & Static Analysis Evidence

### TypeScript Strict Compilation
- **Command**: `cd frontend && npm.cmd run typecheck`
- **Classification**: **VERIFIED**
- **Result**: `tsc --noEmit` exited with **code 0 (0 errors)**.

### ESLint Rules
- **Command**: `cd frontend && npm.cmd run lint`
- **Classification**: **VERIFIED**
- **Result**: `next lint` exited with **code 0 (✔ No ESLint warnings or errors)**.

### Production Build
- **Command**: `cd frontend && npm.cmd run build`
- **Classification**: **VERIFIED**
- **Result**: Compiled 11 routes statically without hydration mismatches or build errors.

---

## 4. Evaluator Automation Scripts Evidence

### Pre-Flight Diagnostic Script (`scripts/check-demo.ps1`)
- **Command**: `powershell -ExecutionPolicy Bypass -File scripts\check-demo.ps1`
- **Classification**: **VERIFIED**
- **Result**:
  - Python Virtual Environment: `[OK] (Python 3.13.14)`
  - Frontend Environment: `[OK] (Node v26.9.0; node_modules present)`
  - Deep Configuration Verifier (`scripts/verify_readiness.py`):
    * Environment keys non-placeholder: `PASS`
    * SQLite database schema (8 tables): `PASS`
    * Vectorize Hindsight Cloud authentication: `PASS (CONNECTED v1.1.0)`
    * Z.ai BigModel API authentication: `PASS (CONNECTED HTTP 200)`
  - Exit code: **0**
- **Negative Testing (Failure Handling)**:
  - When tested with placeholder key `your_hindsight_api_key_here`, `verify_readiness.py` exited with **code 1**, and `check-demo.ps1` aborted with `exit 1`.

### Safe One-Command Startup (`scripts/start-demo.ps1`)
- **Command**: `powershell -ExecutionPolicy Bypass -File scripts\start-demo.ps1`
- **Classification**: **VERIFIED**
- **Result**:
  - Verified pre-flight exit code 0.
  - Alembic migrations checked: `[OK] (Schema up to date)`.
  - Backend daemon launched and confirmed on `http://127.0.0.1:8000/api/v1/health/ready` (PID 217632).
  - Frontend Next.js production server launched and confirmed on `http://localhost:3000` (PID 217312).
  - Process ownership recorded in `scripts/demo-ownership.json`.

### Safe Process Shutdown (`scripts/stop-demo.ps1`)
- **Command**: `powershell -ExecutionPolicy Bypass -File scripts\stop-demo.ps1`
- **Classification**: **VERIFIED**
- **Result**:
  - Inspected backend PID 217632: verified command line contained `python.exe` and `backend.app.main:app`. Terminated cleanly.
  - Inspected frontend PID 217312: verified command line contained `node.exe` and `next start`. Terminated cleanly.
  - Ports 8000 and 3000 verified free.

---

## 5. Compliance & Content Audit Evidence

### Prohibited Competition Terms Scan
- **Command**: Automated regex audit across 10 submission files.
- **Classification**: **VERIFIED**
- **Result**: **0 occurrences of prohibited terms** found.

### Lead Technical Article Word Count
- **Command**: Word count audit on `article.md`.
- **Classification**: **VERIFIED**
- **Result**: **1,480 words** (strictly inside the required 1,200–1,500 word range).
- **Title**: *"Building Continuous AI Marketing Agents with Vectorize Hindsight"* (8 words).

### Band AI Desktop Status
- **Classification**: **PENDING**
- **Status**: CLI executable `band` not found in local Windows test environment PATH. Not claimed as complete. Each participant must install and confirm before submitting their Individual Profile Review form.

### External Publishing Deliverables Status
- **Classification**:
  - `article.md` (Adarsh): `READY_TO_PUBLISH`
  - LinkedIn Post (Adarsh): `READY_TO_PUBLISH`
  - Reddit Link Post (Adarsh): `PENDING_PUBLICATION`
  - Participant 2 Article/LinkedIn/Reddit: `PENDING_PUBLICATION`
  - Participant 3 Article/LinkedIn/Reddit: `PENDING_PUBLICATION`
  - Team YouTube Demo Video: `PENDING_PUBLICATION`
