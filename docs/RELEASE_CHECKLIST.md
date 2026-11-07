# CampaignEcho — Release Checklist & Evaluation Runbook

**Version**: 1.0.0 (Milestone 6 Production Verification & Engineering Audit)  
**Status**: Ready for Final Demonstration & Evaluator Walkthrough  
**Target Date**: November 8, 2026

---

## 1. Local Runtime Verification

Before recording demonstration videos or conducting evaluator walkthroughs, ensure both application daemons and databases are online:

### Step 1: Start Backend Daemon
```powershell
# In c:\CampaignEcho
.\venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000
```
- Verify: `curl http://127.0.0.1:8000/api/v1/health/ready` returns `{"status":"ready","database":"connected","version":"0.1.0"}`.

### Step 2: Start Frontend Next.js Server
```powershell
# In c:\CampaignEcho\frontend
npm.cmd start
# (Or npm.cmd run dev for development mode)
```
- Verify: Access `http://localhost:3000` in Chrome/Edge.

### Step 3: Run Full Automated Verification Suite
```powershell
# In c:\CampaignEcho
.\venv\Scripts\pytest.exe -v --tb=short backend/tests
```
- Expected: **39 passed, 0 skipped, 0 failed, 0 warnings** (including all 5 live Hindsight Cloud integration tests and live continuous learning loop).

---

## 2. Live Demonstration Flow (4 Minutes)

Follow [docs/VIDEO_SCRIPT.md](file:///c:/CampaignEcho/docs/VIDEO_SCRIPT.md) for the exact script.

### Key Scenes to Showcase:
1. **The Executive Overview (`/`)**:
   - Show the compact readiness strip: SQLite connected, Vectorize Hindsight Cloud authenticated & verified, Z.ai GLM-4.5-Flash active.
   - Highlight the verified brand isolation posture and live memory bank counters.
2. **Brand Memory Isolation (`/brands`)**:
   - Inspect "The Taco Syndicate" workspace.
   - Demonstrate dedicated tenant isolation: each brand maintains a server-managed dedicated memory bank with zero cross-brand memory leakage.
3. **Memory-Grounded Campaign Strategy (`/campaign-studio`)**:
   - Fill out a brief for "The Taco Syndicate" (e.g. Flash Walk-In Traffic on Instagram Reels).
   - Select Z.ai GLM-4.5-Flash as the active production LLM.
   - Click "Generate Strategy". Show real-time streaming/loading.
   - Inspect the resulting strategy:
     - High-impact Reel concepts with creative angles, timing, and sound design.
     - **Memory Citation Chips**: Click on a citation to reveal its exact Hindsight Cloud memory ID and originating empirical takeaway.
     - **Epistemic Triad**: Point out the strict separation between Observed Facts, Strategic Inferences, Actionable Recommendations, and Unresolved Uncertainties.
4. **Closing the Continuous Learning Loop (`/campaign-history` & Studio Drawer)**:
   - Select the generated campaign and click "Submit Performance Results".
   - Enter synthetic performance observations (e.g. 48,200 impressions, 389 redemptions, peak conversion between 11 PM and 1 AM).
   - Submit. Watch the status transition to `COMPLETED`.
   - Point out that Hindsight retained the postmortem (`aretain`) and created episodic cognitive memory facts in the brand bank.
5. **Memory Evolution Controlled A/B Audit (`/memory-evolution`)**:
   - Signature capability: Click "Load Demo Brief" or select a brand.
   - Click "Compare Strategies".
   - View the side-by-side deck: Mode A (Stateless Baseline with 0 citations) vs Mode B (Vectorize Hindsight Powered with verified citations).
   - Walk through the Verifiable Differences Ledger: 6 concrete dimensions, zero fake percentage scores, grounded citations, and avoided past historical mistakes.
5. **Memory Explorer Verification (`/memory-explorer`)**:
   - Open Memory Explorer.
   - Switch between **[Live Hindsight Cloud Bank]** (14 real recalled records with cloud UUIDs) and **[Demonstration Fixtures]** (baseline fixtures).
   - Show the green verified status banner: `Vectorize Hindsight Cloud Connected · Operations Verified`.
   - Show that raw internal bank IDs are protected server-side.

---

## 3. Submission Artifacts Checklist

- [x] **Codebase**: Next.js 15+ frontend, FastAPI backend, SQLite DB, SQLAlchemy ORM.
- [x] **Hindsight Integration**: Vectorize Hindsight Cloud (`retain`, `recall`, `reflect`) verified live.
- [x] **LLM Integration**: Z.ai GLM-4.5-Flash verified live with reasoning output handling (Groq failover marked disabled).
- [x] **Test Evidence**: 35/35 pytest suite passing with live E2E test.
- [x] **UI Verification**: Playwright screenshots across all 6 core desktop routes + 3 mobile routes with 0 console errors.
- [x] **Article**: `article.md` written (~1,350 words, title $\le$ 10 words, tagged Code.in, 0 banned words).
- [x] **Video Script**: `docs/VIDEO_SCRIPT.md` finalized (4-minute demo script, 0 banned words).
- [ ] **Video Recording**: Record video using Loom/OBS following the video script.
- [ ] **Article Publishing**: Publish `article.md` on Dev.to / Hashnode / Peerlist.
- [ ] **Form Submission**: Complete the Google Form with GitHub repo, video URL, and article URL.

---

## 4. Troubleshooting & Notes

- **Z.ai Latency**: GLM-4.5-Flash is a reasoning model. When generating full campaign JSON with citations and triad, generation takes ~60–80 seconds. Ensure browser timeout is not aborted early.
- **Hindsight Cloud Connectivity**: Requires an active internet connection to reach `https://api.hindsight.vectorize.io`.
