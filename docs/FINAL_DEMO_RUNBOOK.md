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
- **Frontend Workspace**: `http://localhost:3000`
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

To independently verify all 39 tests (including 5 live Hindsight Cloud tests):
```powershell
.\venv\Scripts\pytest.exe -v --tb=short backend/tests
```
**Expected Result**: `39 passed, 0 skipped, 0 failed, 0 warnings in ~190s`.

---

## 3. Evaluator Walkthrough Flow (Step-by-Step)

### Phase 1: Institutional Memory Baseline (`/memory-explorer` & `/settings`)
1. Open `http://localhost:3000/memory-explorer`.
2. Select **The Taco Syndicate**.
3. Inspect the active Vectorize Hindsight memory bank:
   - **Live Cloud Bank tab**: Displays 14 real recalled memories from `campaignecho-brand-9d215d96...`.
   - Notice the high-performing hooks: midnight flash codes (11 PM - 1 AM) and ASMR cheese pulls.
   - Notice the negative heuristics: gourmet fine-dining positioning ($18 truffle tacos) severely alienated the student customer base.
4. Open `http://localhost:3000/settings`:
   - Point out the `OPERATIONS_VERIFIED` badge and deterministic 1:1 server-managed bank ID mapping.

### Phase 2: Memory-Grounded Campaign Strategy (`/campaign-studio`)
1. Open `http://localhost:3000/campaign-studio`.
2. Select **The Taco Syndicate**.
3. Enter Brief:
   - **Campaign Name**: "Late-Night Queso Drop"
   - **Primary Objective**: "Drive midnight walk-ins among West Campus students"
   - **Platform**: "Instagram Reels"
   - **Offer**: "Free loaded queso with any 2-taco box after 10 PM"
4. Click **Generate Memory-Grounded Strategy**.
5. Inspect the generated strategy deck:
   - **Epistemic Triad**: Clear demarcation of **Observed Facts**, **Strategic Inferences**, **Actionable Recommendations**, and **Uncertainties**.
   - **Memory Citation Chips**: Click citation chip `MEM-d944` to view the provenance modal verifying the prior $1,150 spend and 389 redemptions that grounded the recommendation.

### Phase 3: The Signature Feature — Memory Evolution (`/memory-evolution`)
1. Open `http://localhost:3000/memory-evolution`.
2. Click **Load Demo Brief** or select **The Taco Syndicate**.
3. Click **Compare Strategies**:
   - The engine generates two strategies under identical conditions (same brief, brand profile, provider, model, temperature 0.7, token budget 8192).
   - **Mode A (Stateless Baseline)**: Generated with 0 memory access. Contains 0 citations and resorts to generic student hunger tropes.
   - **Mode B (Hindsight Memory-Powered)**: Grounded in Vectorize Hindsight `recall` and `reflect`. Contains 3 verified citations and grounds flash codes specifically between 11 PM and 1 AM.
4. Scroll to the **Verifiable Differences Ledger**:
   - Review 6 concrete dimensions (Historical Evidence, Brand Constraints, Past Mistakes Avoided, Strategic Differentiation, Citation Integrity, Epistemic Uncertainties).
   - **Anti-Slop Guarantee**: Zero fake AI percentage scores (no "95% better"). Only verifiable empirical divergences.

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
