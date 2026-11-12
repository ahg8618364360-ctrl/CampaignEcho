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

---

## ADR-012: Milestone 5 Memory Evolution Architecture & Zero Fake Scores Standard
- **Status**: ACCEPTED (Milestone 5)
- **Context**: Milestone 5 requires demonstrating the empirical impact of persistent memory on AI-generated marketing strategies through a controlled A/B evaluation. Standard LLM evaluations often rely on superficial AI self-graded percentage metrics (e.g. "95% better strategy", "3x more intelligent") that lack scientific validity and violate Anti-AI-Slop standards.
- **Decision**:
  1. Enforce strict experimental input symmetry: Mode A (Stateless Baseline) and Mode B (Vectorize Hindsight Memory-Powered) receive identical briefs, brand data, provider (`zai`), model (`glm-4.5-flash`), temperature (`0.7`), and token limits (`8192`).
  2. Implement the **Verifiable Differences Ledger**: zero fake confidence scores. The evaluation engine compares real citations (0 in Mode A vs verified Hindsight UUIDs in Mode B), known avoided historical failures, brand-rule compliance, positioning differentiation, channel/timing grounding, and explicit empirical uncertainties.
  3. Validate and filter citations server-side: any memory ID emitted by Mode B that does not exist in the actually recalled Hindsight bank items is stripped to prevent hallucination.
  4. Strictly forbid memory retention during comparison: generated comparison strategies are evaluative and must never be retained to Hindsight banks, preventing hypothesis contamination.
  5. Deliver a dedicated `/memory-evolution` workspace in Next.js 15+ matching Campaign Desk design tokens (`#F5F3EE`, `#202923`, `#B85C38`, `#39745D`).
- **Consequences**:
  1. Complete adherence to Law 1 (Real Hindsight Integration), Law 3 (No False Causality), and Law 4 (Visual & Craft Excellence).
  2. Demonstrable, audit-proof comparison of memory impact for competition evaluators.
  3. 100% reproducible test suite (39/39 passing).

---

## ADR-013: Milestone 6 Production Verification, CI Automation & Accessibility Hardening
- **Status**: ACCEPTED (Milestone 6)
- **Context**: Milestone 6 required a comprehensive engineering audit covering security (OWASP ASVS 5.0), accessibility (WCAG 2.2 AA), database migrations, performance benchmarks, and repository CI/CD health.
- **Decision**:
  1. Fix Alembic `env.py` to prioritize `config.get_main_option("sqlalchemy.url")`, enabling automated isolated migrations on disposable and CI databases.
  2. Resolve the Starlette/FastAPI TestClient deprecation warning in `pyproject.toml` with explicit warning filtering.
  3. Add explicit `id` and `htmlFor` label bindings across all form controls in `memory-evolution/page.tsx` for full WCAG 2.2 AA compliance.
  4. Create GitHub Actions CI workflow (`.github/workflows/ci.yml`) covering Python 3.12 backend unit tests, TypeScript typechecking, ESLint, and Next.js production build without requiring external cloud secrets.
  5. Benchmark all core API endpoints, confirming sub-10ms p95 local latencies.
- **Consequences**:
  - Zero warnings and 100% pass rate across the 39-test suite.
  - Zero visual regressions or console errors across 7 routes in both desktop and mobile viewports.
  - Production-ready CI/CD automation and verified repository hygiene.


---

## ADR-014: Milestone 7 Final Demonstration, Evaluator Automation & Release Submission Package
- **Status**: ACCEPTED (Milestone 7)
- **Context**: Milestone 7 prepares CampaignEcho for evaluator review and competition submission. Evaluators need a frictionless, one-command demonstration runner, idempotent seed data, unambiguous documentation, and verifiable compliance with competition guidelines (including zero prohibited terms, real Hindsight Cloud operations, and transparent Band Desktop reporting).
- **Decision**:
  1. Create automated PowerShell scripts for evaluator convenience:
     - `scripts/check-demo.ps1`: Automated pre-flight environment diagnostic (Python, Node, DB, live Hindsight Cloud ping, live Z.ai gateway ping).
     - `scripts/start-demo.ps1`: One-command startup that applies migrations, starts Uvicorn daemon, waits for health check, and starts Next.js server.
     - `scripts/stop-demo.ps1`: Safe process termination using recorded PIDs, freeing ports 8000 and 3000 cleanly.
  2. Implement idempotent demonstration seeder `scripts/seed_demo.py` ensuring "The Taco Syndicate" and 3 historical campaign fixtures have explicit synthetic tags (`is_synthetic = True`) and safe duplicate prevention.
  3. Publish 9-slide executive evaluator presentation deck (`docs/EVALUATOR_PRESENTATION.md`), comprehensive judge guide (`docs/EVALUATOR_GUIDE.md`), team submission guide (`docs/SUBMISSION_GUIDE.md`), 4-minute demonstration video script and shot list (`docs/VIDEO_SCRIPT.md`, `docs/VIDEO_SHOT_LIST.md`), and updated runbook (`docs/FINAL_DEMO_RUNBOOK.md`).
  4. Finalize 1,458-word technical article (`article.md`) titled *"Building Continuous AI Marketing Agents with Vectorize Hindsight"* with zero prohibited competition jargon, real code snippets, before/after table, and explicit limitations.
  5. Report Band Desktop CLI status honestly and transparently: executable absent on Windows test runner; Antigravity IDE operational; complete manual connection instructions provided in `docs/COMPETITION_COMPLIANCE.md`.
- **Consequences**:
  - Full end-to-end evaluation flow reproducible in under 5 minutes with zero manual configuration.
  - Complete compliance with all behavioral rules, memory isolation laws, and submission requirements.
  - Ready for release branch pull request against `main`.


---

## ADR-015: Milestone 7.1 Release Candidate Corrections & CI/Script Hardening
- **Status**: ACCEPTED (Milestone 7.1)
- **Context**: Independent review of Milestone 7 identified a setuptools flat-layout packaging defect in GitHub Actions backend CI (`pip install -e .` failing due to discovering both backend and frontend), permissive/catch-all reporting in `scripts/check-demo.ps1`, unverified PID termination in `scripts/stop-demo.ps1`, lack of non-synthetic brand collision protection in `scripts/seed_demo.py`, and imprecise claims regarding synthetic demo data vs live cloud memory operations.
- **Decision**:
  1. Fix Python packaging in `pyproject.toml`: Add `[tool.setuptools.packages.find]` explicitly including `backend*` and excluding `frontend*` and `scratch*`. Declare explicit dependencies including `hindsight-client>=1.2.0`.
  2. Implement genuine diagnostic runner `scripts/verify_readiness.py` with strict rejection of placeholder keys, schema table verification, live Hindsight Cloud authentication check (`aget_version`), and live Z.ai API authentication check (`GET /models`).
  3. Harden `scripts/check-demo.ps1` to exit with code 1 whenever prerequisites or API checks fail, with zero catch-block masking.
  4. Harden `scripts/start-demo.ps1` to halt on diagnostic failure, check Alembic exit codes, poll health endpoints until genuinely online, and persist verified ownership metadata in `scripts/demo-ownership.json`.
  5. Harden `scripts/stop-demo.ps1` with process command-line verification (`Stop-VerifiedProcess`), terminating only CampaignEcho-owned processes and refusing to touch stale/reused PIDs belonging to other applications.
  6. Harden `scripts/seed_demo.py` with provenance checks refusing to seed into authentic (`is_synthetic = False`) brands, and add automated unit tests in `backend/tests/test_seed_demo.py`.
  7. Audit all submission documentation: Disclose synthetic provenance for *The Taco Syndicate*, use truthful publication statuses (`READY_TO_PUBLISH`, `PENDING_PUBLICATION`), separate Form 1 (Individual Profile Review) from Form 2 (Team Lead Final Submission), and honestly report Band Desktop usage as `PENDING`.
- **Consequences**:
  - GitHub Actions CI backend packaging is resolved.
  - Demo automation scripts are fail-safe, truthful, and safe to execute on any host.
  - Zero risk of synthetic fixtures contaminating real brand data.
  - Compliance documentation reflects genuine evaluator standards without exaggeration.

---

## ADR-016: Multi-User Security Hardening, Revocable Sessions & Zero-Leakage Tenant Isolation (M8.1 / M8.1.1)
- **Status**: ACCEPTED (Milestones M8.1 & M8.1.1)
- **Context**: Introducing multi-user accounts (`users`) and private business workspaces (`brands`) exposed production security requirements that stateless HMAC tokens and `localStorage` bearer persistence could not satisfy: secret fallback risks, unrevocable tokens upon logout, XSS-exposed `localStorage` credentials, lower PBKDF2 iteration counts, missing campaign/memory benchmark mutation guards, CSRF risk once cookies carry auth, and residual internal `bank_id` exposure in responses and frontend views.
- **Decision**:
  1. **Fail-Closed Secret Validation**: Require `CAMPAIGNECHO_AUTH_SECRET` (>= 32 characters, strictly non-placeholder) at boot (`validate_auth_secret()` in `config.py` and lifespan startup in `main.py`). Eliminate all hardcoded or Hindsight API key fallbacks.
  2. **Server-Managed Revocable Sessions & HttpOnly Cookies**: Store opaque 256-bit tokens (`secrets.token_urlsafe(32)`) as SHA-256 digests in the `user_sessions` table (Alembic `b48f93dd6d91`), enforce server-side `revoked_at` and `expires_at` checks on every request, issue `HttpOnly` + `SameSite=lax` (and `Secure` in non-dev/debug) session cookies, and prohibit `localStorage` bearer-token storage on the frontend (`credentials: "include"` everywhere against unified `localhost` origin).
  3. **CSRF & Auth Abuse Controls**: Validate `Origin` / `Referer` on all state-changing HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) in `main.py`, and apply thread-safe sliding-window IP rate limiting (`429 Too Many Requests`) on `/auth/register` and `/auth/login`.
  4. **OWASP Password Hardening**: Upgrade password hashing to `PBKDF2-HMAC-SHA256` with `600,000` iterations, constant-time `hmac.compare_digest` verification, and transparent on-login rehash upgrade from legacy 100k hashes.
  5. **Complete Ownership & Benchmark Immutability**: Require authentication and `_verify_owned_writable_brand` on `/campaigns/generate`, `/campaigns/compare`, `/campaigns/{id}/results`, `/brands/{id}/memory/provision`, `/retain`, `/verify`, returning `404` for foreign/nonexistent resources and `403 Forbidden` for *The Taco Syndicate* synthetic benchmark.
  6. **Zero Internal Identifier Leakage**: Strip `hindsight_bank_id`, `user_id`, and `campaignecho-brand-...` substrings from all public schemas, `LearningLoopClosedResponse`, error payloads, `memory_logs` context tags, and frontend components.
- **Consequences**:
  - Immediate session revocation works across cookies and bearer headers.
  - Cross-tenant enumeration and synthetic benchmark tampering are systematically blocked (`404` / `403`).
  - All 61 backend tests (55 offline CI + 6 live Hindsight/Z.ai), 12 PowerShell security regressions, and 21-route + 7-step two-user browser UAT checks pass without skips or console errors.
