# CampaignEcho — Agent Engineering Rules & Behavioral Constitution

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Architecture Standard**: Modular Next.js 15+ Frontend, FastAPI Backend, Vectorize Hindsight Memory Engine, Groq LLM  
**Governing Standard**: Phase-based GSD execution, strict verification before claims, zero fake data or mock substitutions during integration verification.

---

## 1. Core Architectural Laws

### Law 1: Real Hindsight Integration Only
- Every memory operation (**Retain**, **Recall**, **Reflect**) must use the real Vectorize Hindsight client or engine (`hindsight-client` / `hindsight-api`).
- Memory banks are strictly 1:1 per Brand (`bank_id = f"campaignecho-brand-{brand_id}"`).
- Memory banks must be created idempotently; never generate a random bank ID per request.
- Stored memories must NEVER be fabricated or hallucinated.
- Unit test mocks are allowed for isolated offline testing, but passing mocked tests must NEVER be presented as proof of real Hindsight integration.

### Law 2: Strict Brand Memory Isolation
- The backend MUST enforce strict tenant boundaries. A brand cannot query or retrieve memories from another brand's memory bank under any circumstance unless an explicit cross-brand synthesis is initiated.
- All bank ID mappings are validated and owned server-side. Never expose unrestricted bank access to the frontend.

### Law 3: Real Causal Reasoning, No False Causality
- Campaign metrics (impressions, clicks, reach) are historical observations, NOT proof of causation.
- The AI must explicitly distinguish between **Observed Performance**, **Historical Patterns**, **Hypotheses**, and **Actionable Recommendations**.
- If memory evidence is sparse or non-existent, the agent must declare the brand is in its initial learning stage; never pretend to remember unrecorded history.

### Law 4: Visual & Craft Excellence (Anti-AI-Slop)
- Adhere strictly to [docs/DESIGN_REFERENCE_LOCK.md](file:///c:/CampaignEcho/docs/DESIGN_REFERENCE_LOCK.md).
- Do not build generic chatbot conversational interfaces for marketing strategy generation. Use structured executive workspace decks with clear information hierarchy.
- Every strategic claim and reel concept must render its **Memory Citation Chip** referencing the originating memory item.
- No neon gradient soup, no emoji navigation, no unverified placeholder charts.

### Law 5: Verification Before Completion
- Never mark a task or milestone complete based solely on code generation.
- Execute the code, run the tests, capture the outputs, inspect for errors, and provide verifiable proof.

---

## 2. Technical Stack Standards

- **Frontend**: Next.js App Router, TypeScript (strict mode), Tailwind CSS, shadcn/ui, Lucide React, Recharts.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2 schemas, SQLAlchemy 2.0 ORM, SQLite database for local MVP.
- **LLM Engine**: Groq API (e.g. `llama-3.3-70b-versatile` or `mixtral-8x7b-32768`), centralized in backend service.
- **Memory Engine**: Vectorize Hindsight (`hindsight-client`).
- **Browser QA**: Playwright automation MCP / headless test runner.

---

## 3. Workflow & Milestone Rules

- Follow the sequential milestones M0 through M7.
- No autonomous infinite loops (No Ralph Loop). Human review gates are maintained between milestones.
- Update `docs/PROGRESS.md` and `docs/DECISIONS.md` whenever architectural choices or milestones advance.

