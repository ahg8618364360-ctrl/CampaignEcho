# CampaignEcho Test & Verification Plan

**Verification Principle**: Evidence before assertions always. No test passes by assumption or code inspection alone. Every claim of completion requires executed command output and runtime logs.

---

## 1. The Critical Acceptance Test (Cross-Session Persistence & Isolation)

This is the definitive test mandated by the CampaignEcho specification:

### Test Sequence
1. **Step A (Brand A Creation)**:
   - Call `POST /api/v1/brands` to create Brand A (`"The Taco Syndicate"`).
   - Verify deterministic bank ID generated: `campaignecho-brand-{brand_a_id}`.
2. **Step B (Retain Experience in Brand A)**:
   - Retain a concrete past experience: *"Late night BOGO burrito promotions after 9 PM drove 380 redemptions with university students, whereas weekday lunch discounts had zero conversion."*
   - Verify Hindsight returns successful retention confirmation.
3. **Step C (Complete Session Termination)**:
   - Terminate the client process / clear in-memory state.
4. **Step D (Fresh Session Re-Launch)**:
   - Launch a completely new application session.
5. **Step E (Submit Brief for Brand A)**:
   - Submit campaign brief: *"Plan an upcoming student promotion to drive store foot traffic."*
6. **Step F (Verify Recall)**:
   - Verify that Hindsight recalls the *"after 9 PM late-night BOGO"* memory.
7. **Step G (Verify Strategy Generation)**:
   - Verify the generated strategy incorporates late-night hours and BOGO pricing.
8. **Step H (Inspect Evidence Citations)**:
   - Verify the strategy's `memory_evidence_summary` explicitly cites the past BOGO experience.
9. **Step I (Brand B Isolation Verification)**:
   - Create Brand B (`"Luxe Parisian Spa"`).
   - Submit brief for Brand B: *"Plan a weekend promotion for relaxation packages."*
   - Verify Brand B's recall results contain ZERO taco, burrito, or student BOGO memories. Memory banks are strictly isolated.

---

## 2. Test Suites & Coverage Hierarchy

```
tests/
├── unit/
│   ├── test_brand_service.py         # Brand CRUD and bank ID determinism
│   ├── test_campaign_schemas.py      # Pydantic v2 validation for inputs & strategies
│   ├── test_memory_adapter_mock.py   # Isolated unit tests with mocked Hindsight responses
│   ├── test_memory_unit.py           # M2 unit suite: Provisioning, retain/recall/reflect, telemetry logging (9 tests)
│   └── test_metrics_math.py          # CPA, ROAS, and conversion calculation accuracy
├── integration/
│   ├── test_hindsight_live.py        # Real Vectorize Hindsight retain, recall, reflect operations
│   ├── test_memory_integration.py    # M2 live integration suite with skip guards for cloud credentials (5 tests)
│   ├── test_groq_live.py             # Real Groq LLM structured JSON output generation
│   ├── test_persistence_loop.py      # End-to-end Brand -> Retain -> Restart -> Recall -> Generate
│   └── test_brand_isolation.py       # Cross-brand memory boundary enforcement
└── e2e_browser/
    ├── test_overview_navigation.spec.ts  # Playwright test: Sidebar, Brand switcher, Overview metrics
    ├── test_campaign_studio.spec.ts      # Playwright test: Brief entry, generation, citation rendering
    ├── test_memory_evolution.spec.ts     # Playwright test: Dual-column Mode A vs Mode B comparison
    └── test_console_errors.spec.ts       # Zero unhandled console error verification
```

---

## 3. Playwright Browser QA & Visual Acceptance Standards

Using the configured Playwright MCP and automated test scripts:

1. **Responsive Viewport Matrix**:
   - Mobile: `375 x 812` (iPhone X / 13 mini)
   - Tablet: `768 x 1024` (iPad portrait)
   - Desktop: `1440 x 900` (MacBook / Standard Laptop)
2. **Visual Checks**:
   - Typography line-height and contrast check (compliance with `docs/DESIGN_REFERENCE_LOCK.md`).
   - No horizontal scrollbars or element cutoffs on mobile.
   - Distinct color-coding of Retain (Emerald), Recall (Blue), and Reflect (Violet).
3. **Console Log Auditing**:
   - Zero `uncaught exception` or `failed to fetch` errors in the browser console.

---

## 4. Execution Commands

```bash
# Run backend unit tests with mocks
pytest -v --tb=short backend/tests

# Run live Hindsight integration tests (requires HINDSIGHT_API_KEY in .env)
pytest -v -m integration backend/tests

# Run all backend tests with coverage
pytest --cov=backend/app --cov-report=term-missing backend/tests/

# Run Playwright UI acceptance tests
npx playwright test

# Verify code simplicity via Ponytail
npx skills run ponytail-audit
```

