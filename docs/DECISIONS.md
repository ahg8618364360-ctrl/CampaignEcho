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
  - Full transparency for technical evaluators and enterprise users regarding memory provenance and live readiness.

---

## ADR-009: Dual-Engine LLM Router with Transparent Failover & Cognitive Learning Loop
- **Status**: SUPERSEDED BY ADR-010 (Refined in M3.1)
- **Context**: Relying on a single third-party LLM provider creates a single point of failure in production. In addition, campaign generation must be grounded in verified Hindsight memories, enforce the Epistemic Triad (Observed Facts, Inferences, Recommendations, Uncertainties), and close the continuous learning loop upon campaign completion.
- **Decision**:
  1. Implement a resilient `LLMService` supporting primary Z.ai (`glm-4.5-flash`).
  2. Persist `llm_provider`, `llm_model`, and `fallback_used` on the `Campaign` model and expose them transparently in client responses.
  3. Ground strategy generation in Hindsight `arecall` (semantic memory retrieval) and `areflect` (brand-level behavioral heuristics).
  4. Enforce the Epistemic Triad in Pydantic schemas and system prompts to prevent hallucinated causality.
  5. Close the loop via `/api/v1/campaigns/{id}/results`, which saves metrics into SQLite, formulates an executive postmortem, retains it directly to Vectorize Hindsight Cloud via `aretain`, and verifies immediate retrievability via `arecall`.
- **Consequences**:
  - Provable continuous learning loop where past postmortems directly steer subsequent campaign strategies.
  - Zero hallucinated causality with complete data provenance.

---

## ADR-010: LLM Provider Hardening, Real Citation Grounding & Reasoning Model Calibration
- **Status**: ACCEPTED (Milestone 3.1)
- **Context**: Milestone 3.1 audit identified three production concerns:
  1. The configured Groq fallback returned HTTP 401 with deprecated model names (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`), creating a misleading impression of failover capability.
  2. Citation parsing in `LLMService` could produce ungrounded or synthetic memory references if not strictly bounded server-side.
  3. Z.ai GLM-4.5-Flash is a reasoning model that emits both extensive chain-of-thought (`reasoning_content`) and structured JSON (`content`), requiring ~75s generation time and a calibrated 180s timeout window.
- **Decision**:
  1. Set `LLM_PROVIDER = "zai"` and `LLM_FALLBACK_ENABLED = False`. In `llm_service.py`, `_call_groq` immediately rejects dummy or unconfigured keys with status 500 without attempting failed HTTP calls. Zero false claims of multi-provider failover are made.
  2. Direct Z.ai API traffic to the responsive upstream endpoint `https://open.bigmodel.cn/api/paas/v4` via `effective_zai_url`.
  3. Enforce server-side citation validation: Every visible citation ID must strictly match an actual Hindsight UUID present in the retrieved memory set. Synthetic or hallucinated IDs are eliminated. When no memories exist, citation lists remain empty.
  4. Calibrate `LLMService` client timeout to 180.0s and handle both `content` and `reasoning_content` to guarantee reliability across deep cognitive reflections.
- **Consequences**:
  - 100% truthful architecture report: Z.ai GLM-4.5-Flash is verified as the sole active production provider.
  - Provable epistemic provenance for all citations rendered in the UI.
  - Zero timeout failures during extensive campaign generation and E2E verification.

---

## ADR-011: UI Truthfulness Alignment, Dual Memory Views & Public Bank ID Protection
- **Status**: ACCEPTED (Milestone 3.2)
- **Context**: Post-M3.1 evaluation identified visual and architectural inconsistencies between backend telemetry and frontend presentations:
  1. Memory Explorer retained obsolete warning banners claiming authentication was required, despite backend reporting `OPERATIONS_VERIFIED`.
  2. The UI globally referenced Groq and "Auto (Dual-Engine)", contradicting ADR-010's standardization on Z.ai.
  3. Brand isolation verification was marked pending in the UI even though live isolation tests passed.
  4. Raw internal deterministic bank IDs (`campaignecho-brand-{brand_id}`) were exposed in public client views, violating Law 2 (Server-side bank ownership).
  5. The previous M3.1 screenshot for Campaign History was captured prematurely while still displaying Campaign Studio.
- **Decision**:
  1. Implement a dedicated `/explore` endpoint in `backend/app/api/v1/memory.py` returning canonical `service_state`, live recalled memory records, and telemetry logs.
  2. Refactor `frontend/src/app/memory-explorer/page.tsx` with dual tabs: `[Live Hindsight Cloud Bank]` (rendering 14 real recalled records with cloud UUIDs and provenance) and `[Demonstration Fixtures]` (3 baseline fixtures). Render verified green banner when `OPERATIONS_VERIFIED`.
  3. Standardize global UI to display `Z.ai — GLM-4.5-Flash (Active Production Provider)` and mark Groq as `Disabled (No valid credentials configured)`. Remove the `Auto (Dual-Engine)` selector.
  4. Update brand isolation banners to `Live Hindsight Brand Isolation Verified`.
  5. Replace exposed internal bank IDs across all screens with user-friendly security labels like `Dedicated Brand Memory Bank (Managed Server-Side)`.
  6. Re-capture all 6 desktop and 3 mobile screens with verified URL, heading, and content assertions.
- **Consequences**:
  - Full consistency between backend verification and client interface.
  - High fidelity, truthful demonstration across all visual and technical touchpoints.
  - Elimination of internal architectural leaks in client UI.
