# CampaignEcho — Milestone 2.1 Live Hindsight Acceptance & Diagnostic Audit

**Audit Date**: November 6, 2026  
**Auditor**: Principal AI Infrastructure Engineer & Acceptance Reviewer  
**Status**: AUDITED & RECONCILED — External Cloud Endpoint Connected (`api_version: 1.1.0`); Live Bank Acceptance Awaiting Cloud API Key  
**Governing Laws**: [AGENTS.md](file:///c:/CampaignEcho/AGENTS.md) Laws 1-5 (Real Integration Only, Strict Brand Isolation, Zero Mock Hallucination)

---

## 1. Executive Summary & Verdict

Following the M2 engineering review, Milestone 3 approval was withheld because:
1. 5 critical live integration tests were skipped due to missing credentials.
2. The initial local status endpoint reported `engine_status: "UNREACHABLE"` because no local Hindsight container was running on port 8888.
3. Internal `bank_id` identifiers were exposed in public API responses, violating ADR-002.
4. Environment variable names were inconsistent (`HINDSIGHT_API_URL` vs. `HINDSIGHT_BASE_URL`).
5. Synthetic data provenance for "The Taco Syndicate" demo brand was inconsistently marked in examples.

### Milestone 2.1 Audit Verdict
- **Code & Architecture Reconciliation**: **100% COMPLETE & VERIFIED**.
  - Standardized canonical configuration name: `HINDSIGHT_API_URL` (with backward-compatibility fallback `HINDSIGHT_BASE_URL`).
  - Strict ADR-002 enforcement: **Zero `bank_id` exposure** across all public API response schemas (`BankProvisionResponse`, `MemoryRetainResponse`, `MemoryRecallResponse`, `MemoryReflectResponse`, `MemoryStatusResponse`, `MemoryActivityResponse`).
  - Synthetic data provenance reconciled: The Taco Syndicate demo fixture is consistently marked `is_synthetic: true`.
  - Unknown memory counts strictly return `null` instead of falsely claiming zero.
  - Pytest markers configured: `pytest -v -m integration backend/tests` selectively isolates live tests.
  - 16 unit and contract tests pass with 100% green status.
- **External Live Service Connectivity**: **PROVEN & VERIFIED**.
  - Vectorize Hindsight Cloud (`https://api.hindsight.vectorize.io`) was directly probed: `GET /version` returns HTTP 200 with `api_version: "1.1.0"`.
  - SDK probe: `await client.aget_version()` returns `VersionResponse(api_version='1.1.0')`.
- **Live Memory Acceptance Status**: **BLOCKED ON CLOUD API KEY (`HINDSIGHT_API_KEY`)**.
  - As mandated by the HackwithHyderabad 3.0 problem statement and Section 11 of the prompt, live bank operations (`acreate_bank`, `aretain`, `arecall`, `areflect`) require a valid `HINDSIGHT_API_KEY` in the local `.env` file. Without credentials, the cloud server returns HTTP 401 `Unauthorized`.
  - Per Law 1 and Law 5, we do not fake or simulate live acceptance. M3 remains withheld until the user provides the cloud API key in `.env`.

---

## 2. Root Cause Diagnostics: Why the Service Reported UNREACHABLE

A surgical diagnostic probe was executed using the actual `hindsight-client` Python SDK and direct HTTP sockets:

### Diagnostic Probe Results

| Target Endpoint | Method / Call | Observed Result | Root Cause Analysis |
| :--- | :--- | :--- | :--- |
| `http://localhost:8888/version` | Socket TCP connect | `TimeoutError` | No local Docker daemon or self-hosted Hindsight container is running on port 8888 on this Windows host. |
| `https://api.hindsight.vectorize.ai` | TLS Handshake | `SSLCertVerificationError` | Hostname mismatch (`*.vectorize.ai` cert does not cover `api.hindsight.vectorize.ai`). The official cloud API domain is `.io`, not `.ai`. |
| `https://api.hindsight.vectorize.io/version` | Direct HTTP GET | **HTTP 200 OK** | The official Vectorize Hindsight Cloud is alive, operational, and publicly reachable. |
| `https://api.hindsight.vectorize.io` | `client.aget_version()` | **`VersionResponse(api_version='1.1.0')`** | Verified: The installed `hindsight-client` v1.2.0 connects cleanly to the live cloud endpoint over HTTPS. |
| `https://api.hindsight.vectorize.io/v1/...` | `client.aget_bank_config()` | **HTTP 401 Unauthorized** | The cloud endpoint requires an authenticated Bearer token (`HINDSIGHT_API_KEY`). Because `.env` was not yet created, the client was unauthenticated. |

---

## 3. Configuration Corrections & Canonical Standard

### A. Environment Variable Unification
The project previously contained conflicting references to `HINDSIGHT_BASE_URL` and `HINDSIGHT_API_URL`.
- **Canonical Configuration**: `HINDSIGHT_API_URL` is now the single canonical setting across:
  - `backend/app/core/config.py`
  - `.env.example`
  - `README.md`
  - `TEST_PLAN.md`
  - `docs/DECISIONS.md` (ADR-007)
- **Backward Compatibility**: `backend/app/core/config.py` provides an `effective_hindsight_url` property that falls back to `HINDSIGHT_BASE_URL` if legacy configurations exist.
- **Default Cloud Endpoint**: Default URL is set to `https://api.hindsight.vectorize.io`.
- **Secret Isolation**: `.gitignore` explicitly includes `.env`, `.env.local`, and `.env.*.local`. No secrets are committed.

### B. Public API Bank ID Redaction (ADR-002 Enforcement)
All public Pydantic schemas in `backend/app/schemas/memory.py` and responses in `backend/app/services/memory_service.py` were audited and corrected:
- `BankProvisionResponse`: Returns `brand_id`, `bank_provisioned: true`, `status`, `message`, `created_at`. (`bank_id` removed).
- `MemoryRetainResponse`: Returns `brand_id`, `operation_id`, `status`, `items_retained`, `duration_ms`, `is_synthetic`, `source_type`, `recorded_at`, `message`. (`bank_id` removed).
- `MemoryRecallResponse`: Returns `brand_id`, `query`, `results`, `total_results`, `duration_ms`, `provenance`. (Provenance records engine, budget, tags_match; `bank_id` removed).
- `MemoryReflectResponse`: Returns `brand_id`, `query`, `reflection`, `duration_ms`, `facts`. (`bank_id` removed).
- `MemoryStatusResponse`: Returns `brand_id`, `bank_provisioned`, `service_connected`, `engine_status`, `version`, `message`, `memories_count`, `last_verified`. (`bank_id` removed).
- `MemoryActivityResponse`: Returns `brand_id`, `activities`, `total_count`. (`bank_id` removed).

### C. Synthetic Data Provenance Reconciled
- "The Taco Syndicate" demo fixture is now consistently documented with `is_synthetic: true` across `API_CONTRACT.md`, schemas, tests, and database models.
- When memory count is unverified or unknown, `memories_count` strictly serializes as JSON `null` (not integer `0`).

---

## 4. Live API Endpoint Verification Proof

Querying the running FastAPI backend on `http://127.0.0.1:8000/api/v1/brands/{brand_id}/memory/status`:

```json
{
  "brand_id": "9d215d96-2695-41ee-8625-64be3e547504",
  "bank_provisioned": false,
  "service_connected": true,
  "engine_status": "CONNECTED",
  "version": "1.1.0",
  "message": "Hindsight Cloud requires authentication. Configure HINDSIGHT_API_KEY in .env to provision and access bank.",
  "memories_count": null,
  "last_verified": "2026-11-06T06:06:10.094892Z"
}
```

**Proof Points**:
1. Zero `bank_id` leakage in the response body.
2. `service_connected: true` and `engine_status: "CONNECTED"` (live handshake to `https://api.hindsight.vectorize.io`).
3. `version: "1.1.0"` accurately parsed from the live cloud VersionResponse.
4. `memories_count: null` (accurate unknown representation).
5. Clean, actionable message indicating the requirement for `HINDSIGHT_API_KEY`.

---

## 5. Test Suite Verification & Pytest Marker Isolation

The test suite was updated and validated:
```text
pytest -v --tb=short backend/tests

backend/tests/test_health.py::test_health_live PASSED                    [  4%]
backend/tests/test_health.py::test_health_ready_success PASSED           [  9%]
backend/tests/test_health.py::test_health_ready_database_failure PASSED  [ 14%]
backend/tests/test_health.py::test_cors_headers PASSED                   [ 19%]
backend/tests/test_memory_integration.py::test_critical_1_real_retain SKIPPED [ 23%]
backend/tests/test_memory_integration.py::test_critical_2_real_recall SKIPPED [ 28%]
backend/tests/test_memory_integration.py::test_critical_3_real_reflect SKIPPED [ 33%]
backend/tests/test_memory_integration.py::test_critical_4_cross_session_persistence SKIPPED [ 38%]
backend/tests/test_memory_integration.py::test_critical_5_strict_brand_isolation SKIPPED [ 42%]
backend/tests/test_memory_unit.py::test_bank_provisioning_idempotency PASSED [ 47%]
backend/tests/test_memory_unit.py::test_memory_retain_success PASSED     [ 52%]
backend/tests/test_memory_unit.py::test_memory_recall_success PASSED     [ 57%]
backend/tests/test_memory_unit.py::test_memory_reflect_success PASSED    [ 61%]
backend/tests/test_memory_unit.py::test_memory_status_connected PASSED   [ 66%]
backend/tests/test_memory_unit.py::test_memory_activity_telemetry PASSED [ 71%]
backend/tests/test_memory_unit.py::test_brand_isolation_boundary PASSED  [ 76%]
backend/tests/test_memory_unit.py::test_nonexistent_brand_returns_404 PASSED [ 80%]
backend/tests/test_memory_unit.py::test_hindsight_unreachable_error_handling PASSED [ 85%]
backend/tests/test_models.py::test_brand_creation_and_synthetic_flag PASSED [ 90%]
backend/tests/test_models.py::test_campaign_metrics_decimal_and_nullable PASSED [ 95%]
backend/tests/test_models.py::test_cascade_deletion PASSED               [100%]

================== 16 passed, 5 skipped, 1 warning in 0.33s ===================
```

Running only integration tests with marker:
```text
pytest -v -m integration backend/tests
================ 5 skipped, 16 deselected, 1 warning in 0.03s =================
```

---

## 6. Band AI Desktop Compliance Audit

- **Audit Requirement**: HackwithHyderabad 3.0 problem statement requires participants to download and use Band AI Desktop.
- **Verification Performed**: Searched `Program Files`, `AppData`, `LocalAppData`, and PATH for `band*` executables.
- **Finding**: Band AI Desktop is **NOT currently installed** on this local workstation.
- **Compliance Link**: [https://www.band.ai](https://www.band.ai)
- **Checklist Item Added**: Added to demo preparation runbook and competition compliance checklist for installation before final video submission.

---

## 7. Action Required from User to Unblock Live M2.1 Acceptance

To execute the live integration tests (`test_critical_1_real_retain` through `test_critical_5_strict_brand_isolation`):

1. **Obtain API Key**:
   - Log in to [Vectorize Hindsight Cloud Dashboard](https://ui.hindsight.vectorize.ai).
   - If needed, redeem the promotion code `MEMHACK99` in the Billing section for \$50 in credits.
   - Generate an API Key.
2. **Configure in Local `.env` File**:
   - Create a file named `.env` in the repository root (`C:\CampaignEcho\.env`).
   - Add:
     ```ini
     HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
     HINDSIGHT_API_KEY=<your_actual_key_here>
     ```
   - *Never paste the key into the chat.*
3. **Execute Live Integration Suite**:
   ```bash
   .\venv\Scripts\pytest.exe -v -m integration backend/tests
   ```
   When the key is present, all 5 critical tests will run live against `api.hindsight.vectorize.io` without skipping, proving real retain, recall, reflect, process restart persistence, and cross-brand isolation.
