# CampaignEcho — Official Evaluator Demonstration Runbook

**System**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Memory Engine**: Vectorize Hindsight Cloud (`api.hindsight.vectorize.io`)  
**LLM Engine**: Z.ai GLM-4.5-Flash (Active Production Provider)  
**Target Duration**: 3–5 Minutes (Comprehensive Evaluator Walkthrough)  
**Standard**: Refero Campaign Desk Design & Zero Fake AI Scores  

---

## 1. Quick-Start (One-Command Startup)

> [!NOTE]
> **Synthetic Data Provenance Note**: *The Taco Syndicate* brand profile and its seeded campaign metrics (e.g. 48,200 impressions, 389 redemptions, $1,150 spend) are synthetic evaluation fixtures (`is_synthetic = True`). All Vectorize Hindsight operations (`aretain`, `arecall`, `areflect`) and Z.ai inferences shown during the demo are real live cloud API operations.

Open PowerShell in `C:\CampaignEcho`:
```powershell
# Pre-flight check & one-command demonstration launch
.\scripts\start-demo.ps1
```
The startup script validates Python/Node dependencies, runs Alembic migrations, checks external cloud connectivity (Vectorize Hindsight Cloud & Z.ai), and launches both services:
- **Public Editorial Landing**: `http://localhost:3000`
- **Authenticated Workspace**: `http://localhost:3000/workspace`
- **Memory Evolution (A/B)**: `http://localhost:3000/memory-evolution`
- **Campaign Studio**: `http://localhost:3000/campaign-studio`
- **Memory Explorer**: `http://localhost:3000/memory-explorer`
- **Backend Readiness**: `http://127.0.0.1:8000/api/v1/health/ready`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`

To stop services when finished:
```powershell
.\scripts\stop-demo.ps1
```

---

## 2. Automated Test Verification (Optional Pre-Flight)

To independently verify the complete test suite (61 tests total, including 6 live Vectorize Hindsight Cloud operations):
```powershell
.\venv\Scripts\pytest.exe -v --tb=short backend/tests
```
**Expected Result**: `61 passed, 0 skipped, 0 failed in ~150s`.

To run only the CI test suite (55 unit, contract, and tenant security tests):
```powershell
.\venv\Scripts\pytest.exe -v --tb=short backend/tests -k "not test_critical_ and not test_live_continuous_learning_loop_e2e"
```

To run the automated Playwright browser UAT suite (21 responsive route checks + 7 multi-tenant journey steps):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\run_integrated_uat.ps1
```

---

## 3. Evaluator Walkthrough Flow (Step-by-Step)

### Phase 0: Editorial Public Landing Page (`/`)
1. Open `http://localhost:3000/`.
2. Notice the clean, high-conviction product positioning:
   - Headline: *"Your next campaign should remember the last one."*
   - Anti-AI-slop typography: Instrument Serif headline paired with clean DM Sans copy.
   - Primary Call to Action: **Create your workspace**.
   - Secondary Call to Action: **See how it works** (smooth scroll to the 5-step cognitive loop).
3. Review the **5-Step Continuous Cognitive Loop**:
   - `01 Retain` → `02 Recall` → `03 Reflect` → `04 Generate` → `05 Learn`.
4. Review the **Epistemic Triad Architecture**:
   - Explicit demarcation of Observed Facts, Strategic Inferences, and Epistemic Uncertainties.
5. Review the **Evaluator Showcase Guide**:
   - Direct guide for judges testing authentic brand onboarding, multi-tenant memory bank isolation, and strategy evolution.

### Phase 1: Workspace Authentication & Multi-Brand Profile (`/workspace`)
1. Click **Sign in** or navigate to `http://localhost:3000/login`.
2. Enter your credentials or click **Register** to create an evaluator workspace.
3. Upon login, you are redirected to the authenticated workspace dashboard at `/workspace`:
   - Live telemetry status shows `ALIVE` and `CONNECTED` database.
   - If starting fresh, the workspace truthfully reflects the brand's **initial learning stage** with zero synthetic mock cards.
4. To onboard a new brand with isolated memory banks:
   - Navigate to `/onboarding`.
   - Enter your company name (e.g., "Apex Peak Athletics"), industry, primary voice, and core constraints.
   - The platform idempotently derives a 1:1 brand memory bank (`campaignecho-brand-{id}`).

### Phase 2: Memory-Grounded Campaign Strategy (`/campaign-studio`)
1. Open `http://localhost:3000/campaign-studio`.
2. Select your brand from the brand selector.
3. Enter Brief:
   - **Campaign Name**: "Late-Night Queso Drop" (or custom campaign brief)
   - **Primary Objective**: "Drive midnight walk-ins among university students"
   - **Target Audience**: "College students (ages 18-24)"
   - **Geographic Market**: "Austin, Texas"
4. Click **Generate Memory-Grounded Strategy**.
5. Inspect the generated strategy deck:
   - **Epistemic Triad**: Clear demarcation of **Observed Facts**, **Strategic Inferences**, **Actionable Recommendations**, and **Uncertainties**.
   - **Memory Citation Chips**: For established brands, citation chips link directly to past verified performance metrics.

### Phase 3: The Signature Feature — Memory Evolution (`/memory-evolution`)
1. Open `http://localhost:3000/memory-evolution`.
2. Select your brand or click **Fill from Brand Profile** to auto-populate the test brief from the brand's stored guidelines.
3. Click **Compare Strategies**:
   - The engine generates two strategies under identical conditions (same brief, brand profile, provider, model, temperature 0.7, token budget 8192).
   - **Mode A (Stateless Baseline)**: Generated with 0 memory access. Contains 0 citations and resorts to generic tropes.
   - **Mode B (Hindsight Memory-Powered)**: Grounded in Vectorize Hindsight `recall` and `reflect`. Contains verified citations and enforces historical negative constraints.
4. Scroll to the **Verifiable Differences Ledger**:
   - Review 6 concrete dimensions (Historical Evidence, Brand Constraints, Past Mistakes Avoided, Strategic Differentiation, Citation Integrity, Epistemic Uncertainties).
   - **Anti-Slop Guarantee**: Zero fake AI percentage scores (no "95% better"). Only verifiable empirical divergences.

### Phase 4: Closing the Continuous Learning Loop (`/campaign-studio`)
1. In `/campaign-studio`, open **Submit Results & Close Loop**.
2. Enter performance observations:
   - Impressions: `54,200`
   - Redemptions: `412`
   - Spend: `$1,250.00`
   - Lessons Learned: "Flash code CRUNCH22 generated 82% of redemptions between 11:30 PM and 1:00 AM."
3. Click **Retain & Verify Closed Loop**:
   - The backend records quantitative metrics to SQLite.
   - Formulates a structured postmortem and executes Hindsight `aretain`.
   - Executes immediate Hindsight `arecall` verification.
   - Displays green confirmation banner with the live Hindsight Retain Operation ID and sub-second verified retrieval status.

### Phase 5: Verification in Memory Explorer & Campaign History
1. Open `/memory-explorer`:
   - Inspect the active Vectorize Hindsight memory bank.
   - For fresh brands, verify that newly ingested memories appear in real-time.
2. Open `/campaign-history`:
   - Inspect the historical campaign ledger showing completed campaigns, actual conversion metrics, and live Hindsight retention status.
3. **Summary**: Every dollar spent makes the next campaign smarter.

### Phase 4: Closing the Continuous Learning Loop (`/campaign-studio`)
1. Return to `/campaign-studio` and open **Submit Results & Close Loop**.
2. Enter performance observations:
   - Impressions: `54,200`
   - Redemptions: `412`
   - Spend: `$1,250.00`
   - Lessons Learned: "Flash code CRUNCH22 generated 82% of redemptions between 11:30 PM and 1:00 AM."
3. Click **Retain & Verify Closed Loop**:
   - The backend records quantitative metrics to SQLite.
   - Formulates a structured postmortem and executes Hindsight `aretain`.
   - Executes immediate Hindsight `arecall` verification.
   - Displays green confirmation banner with the live Hindsight Retain Operation ID and sub-second verified retrieval status.

### Phase 5: Fresh-Session Learning Proof
1. Open a new Incognito / Private window or navigate to `/campaign-history`.
2. The newly retained experience is indexed in the historical ledger.
3. Generating a subsequent campaign automatically surfaces the fresh memory in the Memory Grounding Desk.
4. **Summary**: Every dollar spent makes the next campaign smarter.
