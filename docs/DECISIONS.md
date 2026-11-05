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

## ADR-002: Deterministic 1:1 Memory Bank Isolation per Brand
- **Status**: ACCEPTED
- **Context**: CampaignEcho manages multiple brands. Cross-brand leakage would violate tenant boundaries.
- **Decision**: Enforce a strict 1:1 mapping between Brand entities and Hindsight memory banks:
  ```python
  bank_id = f"campaignecho-brand-{brand_id}"
  ```
  Bank IDs remain internal backend identifiers and are never exposed in public client API responses.
- **Consequences**:
  - Guarantees strict multi-tenant data boundaries.
  - Keeps low-level memory infrastructure details shielded from the presentation tier.

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
