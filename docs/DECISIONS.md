# CampaignEcho Architectural Decision Records (ADRs)

---

## ADR-001: Vectorize Hindsight as the Sole Memory Engine
- **Status**: ACCEPTED
- **Context**: The project specification requires persistent, brand-specific memory across separate sessions.
- **Decision**: Adopt Vectorize Hindsight exclusively as the memory engine. Use native asynchronous methods (`aretain`, `arecall`, `areflect`) to avoid blocking the FastAPI event loop. Do not introduce fake local memory fallbacks that pretend to represent Hindsight operations.
- **Consequences**:
  - Direct async integration with no event loop starvation.
  - Zero deceptive mock or fake substitutions during integration testing.

---

## ADR-002: Deterministic 1:1 Memory Bank Isolation per Brand & Zero Public Exposure
- **Status**: ACCEPTED (Refined in M2.1)
- **Context**: CampaignEcho manages multiple brands. Cross-brand leakage would violate tenant boundaries. Furthermore, internal bank identifiers must never leak to the public client API.
- **Decision**: Enforce a strict 1:1 mapping between Brand entities and Hindsight memory banks:
  ```python
  bank_id = f"campaignecho-brand-{brand_id.lower()}"
  ```
  Bank IDs remain internal backend identifiers. All public API response schemas (`BankProvisionResponse`, `MemoryRetainResponse`, `MemoryRecallResponse`, `MemoryReflectResponse`, `MemoryStatusResponse`, `MemoryActivityResponse`) explicitly omit `bank_id`.
- **Consequences**:
  - Guarantees strict multi-tenant data boundaries.
  - Keeps low-level memory infrastructure details completely shielded from the presentation tier.

---

## ADR-003: FastAPI & Next.js Decoupled Stack Bound to Localhost
- **Status**: ACCEPTED
- **Context**: We need a responsive web UI paired with Python's AI ecosystem for local hackathon development.
- **Decision**: Decouple the frontend (`frontend/` on port 3000) and backend (`backend/` on port 8000), binding local servers to localhost (`127.0.0.1` / `0.0.0.0` for local interfaces).
- **Consequences**:
  - Independent testing of backend memory operations and frontend visual components.
  - Clearly scoped single-user local development MVP.

---

## ADR-004: Anti-AI-Slop Visual Reference Lock
- **Status**: ACCEPTED
- **Context**: AI marketing tools often default to generic chatbot templates with purple gradient blobs.
- **Decision**: Lock the visual identity to "Editorial SaaS Darkroom" using tokens derived from Linear and Perplexity research:
  - Deep obsidian slate (`#090D16`), 1px hairline borders (`rgba(255,255,255,0.08)`).
  - Tri-color memory telemetry: Retain (Emerald), Recall (Electric Blue), Reflect (Violet).
  - Explicit Memory Citation Chips on all AI-generated strategic recommendations.

---

## ADR-005: Dual Global Skills Discovery Mirroring
- **Status**: ACCEPTED
- **Context**: The Vercel Skills CLI defaults to installing global skills in `~/.agents/skills/`, whereas the native Antigravity App GUI traverses `~/.gemini/config/skills/`.
- **Decision**: Mirror all installed global skills into both locations during environment setup.

---

## ADR-006: Decimal-Safe Monetary Types & Nullable Campaign Metrics
- **Status**: ACCEPTED
- **Context**: Floating-point values cause rounding errors in financial data (budget, spend, CPA, ROAS). Defaulting unknown metrics to 0 confuses missing observations with true zero performance.
- **Decision**: Use `NUMERIC(10,2)` for all currency values with an explicit ISO 4217 currency code. Store unknown campaign metrics as `NULL`.
- **Consequences**:
  - Prevents subtle accounting and calculation bugs.
  - Preserves data provenance and accurate distinction between unrecorded metrics and 0-conversion campaigns.

---

## ADR-007: Native Async Hindsight Client & Canonical Environment Configuration
- **Status**: ACCEPTED (Refined in M2.1)
- **Context**: Milestone 2 and M2.1 audit require integrating Vectorize Hindsight (`hindsight-client` v1.2.0) into the FastAPI backend. Sync client calls inside async routes block the event loop or cause deadlocks. In addition, configuration must be standardized across files, and operational diagnostics tracked without leaking memory text, internal bank IDs, or credentials.
- **Decision**:
  1. Standardize `HINDSIGHT_API_URL` as the canonical configuration name (defaulting to official Vectorize Hindsight Cloud: `https://api.hindsight.vectorize.io`), while maintaining `HINDSIGHT_BASE_URL` as a backward-compatibility alias via `settings.effective_hindsight_url`.
  2. Use pure native asynchronous methods on the official SDK (`aretain`, `arecall`, `areflect`, `acreate_bank`, `aget_version`).
  3. Implement `MemoryService` with strict deterministic bank naming (`campaignecho-brand-{brand_id.lower()}`). Client requests cannot inject arbitrary bank identifiers, and response schemas never expose bank IDs.
  4. Classify engine status transparently into `CONNECTED`, `UNREACHABLE`, and `AUTH_FAILED`. Unknown memory counts must return `null` instead of falsely claiming zero.
  5. Persist privacy-safe operational telemetry into the SQLite `memory_logs` table (`brand_id`, `operation_type`, `items_count`, `latency_ms`, `status`).
  6. Register pytest marker `integration` in `pyproject.toml` so live tests can be executed specifically via `pytest -v -m integration backend/tests`.
- **Consequences**:
  - Zero event loop starvation in high-throughput campaign generation.
  - Provable 1:1 tenant isolation across brands.
  - Safe audit trail for latency and error monitoring without PII or prompt leakage.

---

## ADR-008: 7-State Hindsight Service Health & Truthful UI Model
- **Status**: ACCEPTED
- **Context**: A binary "Connected / Offline" status is misleading when interacting with public cloud endpoints like Vectorize Hindsight Cloud (`https://api.hindsight.vectorize.io`). The public `/version` endpoint returns HTTP 200 without authentication, whereas bank provisioning, retention, and recall require a valid Bearer API key (`HINDSIGHT_API_KEY`). Displaying "Connected" when unauthenticated or claiming empirical bank isolation without verified credentials violates AGENTS.md Law 1 and Law 5.
- **Decision**:
  1. Implement an explicit 7-state lifecycle in `backend/app/schemas/memory.py`:
     - `NOT_CONFIGURED`: Missing endpoint URL.
     - `ENDPOINT_UNREACHABLE`: Network or cloud endpoint down / timed out.
     - `AUTH_REQUIRED`: Endpoint reachable, but API key missing or 401 Unauthorized.
     - `AUTHENTICATED`: API key verified, brand bank not yet checked.
     - `BANK_NOT_PROVISIONED`: Authenticated, but brand bank does not exist in cloud.
     - `BANK_PROVISIONED`: Cloud bank created, no retain/recall operations yet.
     - `OPERATIONS_VERIFIED`: Correlated verification run containing ALL THREE operations (RETAIN, RECALL, REFLECT) completed successfully against the live Hindsight service.
  2. Implement an explicit `MemoryVerificationRun` table and enforce single-run correlation via `verification_run_id`. Disallow fragmented, unrelated logs from inferring verified status. Mocked test operations (`is_live=False`) and failed operations strictly never satisfy verification.
  3. Active authentication revalidation: `get_status` actively validates bank configuration against Hindsight. If credentials are revoked (401), the service immediately transitions to `AUTH_REQUIRED`.
  4. Enforce strict synthetic data provenance across all frontend views. Demonstration fixtures ("The Taco Syndicate") must be explicitly tagged as synthetic (`is_synthetic = true`, `source_type = SYNTHETIC_FIXTURE`).
  5. Brand isolation language lock: "Application-level brand isolation is implemented through deterministic bank mapping. Live Hindsight isolation verification is pending." Prohibit claiming empirical multi-tenant bank isolation until live authenticated tests pass.
- **Consequences**:
  - UI never deceptively indicates functional memory operations when unauthenticated.
  - Full transparency for hackathon evaluators and enterprise users regarding memory provenance and live readiness.
