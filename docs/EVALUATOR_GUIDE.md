# CampaignEcho — Evaluator Comprehensive Guide

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Target Category**: AI Agents That Learn Using Hindsight (Vectorize Hindsight)  
**Evaluator Runbook Version**: Milestone 7 Final Release  
**Repository**: `https://github.com/ahg8618364360-ctrl/CampaignEcho`  

---

## 1. Executive Summary & Verification Overview

CampaignEcho is an enterprise marketing intelligence platform that equips generative AI agents with continuous, persistent memory. Unlike standard LLM marketing tools that suffer from catastrophic amnesia between sessions, CampaignEcho uses **Vectorize Hindsight** (`hindsight-client`) to execute a complete cognitive memory loop:
- **Recall**: Dynamically pulls historical campaign outcomes matching new brief parameters.
- **Reflect**: Synthesizes high-level heuristics and rules of thumb across all past campaigns.
- **Retain**: Encodes verified postmortem performance data into brand-isolated memory banks.

This guide provides judges and technical evaluators with a 5-minute walkthrough to verify every claim made in our submission.

> [!NOTE]
> **Synthetic Data & Provenance Disclosure**: *The Taco Syndicate* brand profile and seeded performance metrics (e.g. 48,200 impressions, 389 redemptions, $1,150 spend) are synthetic evaluation fixtures (`is_synthetic = True`). All Vectorize Hindsight Cloud operations (`aretain`, `arecall`, `areflect`) and Z.ai model inferences demonstrated in the platform are real live cloud API operations.

---

## 2. Quick-Start (One-Command Launch)

### Prerequisites
- **Python**: 3.11+
- **Node.js**: v18+ (v20+ recommended)
- **Environment**: `.env` file at repository root with `HINDSIGHT_API_KEY`, `HINDSIGHT_API_URL`, and `ZAI_API_KEY`.

### Step 1: Run Pre-Flight Diagnostics
```powershell
.\scripts\check-demo.ps1
```
This script validates your Python environment, Node.js packages, SQLite database tables, and executes live network pings to Vectorize Hindsight Cloud and the Z.ai inference gateway. It will confirm:
`Status: READY TO LAUNCH DEMONSTRATION`.

### Step 2: Seed Demonstration Fixtures (Idempotent)
```powershell
.\venv\Scripts\python.exe scripts\seed_demo.py
```
This script sets up the canonical demonstration brand (*The Taco Syndicate*) and seeds 3 historical campaign postmortems with explicit synthetic provenance flags (`is_synthetic = True`). If already seeded, it safely skips insertion.

### Step 3: Launch Frontend & Backend Daemons
```powershell
.\scripts\start-demo.ps1
```
This script automatically:
1. Applies pending database migrations.
2. Starts the FastAPI backend daemon on `http://127.0.0.1:8000` (PID saved to `scripts/backend.pid`).
3. Polls `/health/ready` until backend is verified healthy.
4. Starts the Next.js production server on `http://localhost:3000` (PID saved to `scripts/frontend.pid`).
5. Displays ready status with clickable URLs.

### Step 4: Clean Shutdown
When your evaluation is finished, run:
```powershell
.\scripts\stop-demo.ps1
```
This cleanly terminates only CampaignEcho processes and frees ports 8000 and 3000.

---

## 3. Five-Minute Evaluator Tour

### Stop 1: The Signature Feature — Memory Evolution (`/memory-evolution`)
Open `http://localhost:3000/memory-evolution` in your browser.

1. **Select Brand**: Choose *"The Taco Syndicate"*.
2. **Select Preset Brief**: Click *"Late Night University Tacos"*.
3. **Execute Side-by-Side Comparison**: Click the terracotta **"Run Memory Evolution Comparison"** button.
4. **Observe the Results**:
   - **Mode A (Cold Start / Standard AI)**: Has zero access to historical memory. Generates generic advice (e.g., standard business hour posting, aggressive 50% discounts that erode margins).
   - **Mode B (With Hindsight Memory)**: Recalls 14 historical memories from Hindsight Cloud, synthesizes a live reflection, and produces an empirically grounded strategy (e.g., 7-second countdown reels at 11:15 PM, avoiding margin-destroying discounts in favor of secret sauce perks).
   - **Citation Chips**: Mode B outputs clickable citation chips (`MEM-01`, `MEM-02`, etc.) linking directly to the originating historical records.

### Stop 2: Memory Explorer (`/memory-explorer`)
Open `http://localhost:3000/memory-explorer`.

1. **Inspect Bank Identity**: Notice the deterministic bank ID badge: `campaignecho-brand-the-taco-syndicate`.
2. **Review Memory Ledger**: Browse live memories stored in Vectorize Hindsight Cloud.
3. **Inspect Provenance**: Synthetic fixtures are distinctly tagged with amber `SYNTHETIC FIXTURE` chips, while real retained campaign postmortems bear green `LIVE HINDSIGHT` badges.
4. **Test Real-Time Reflection**: Click *"Synthesize Live Reflection"* to trigger a real Hindsight `areflect` call that summarizes strategic heuristics across all memories.

### Stop 3: Campaign Studio & Closing the Learning Loop (`/campaign-studio`)
Open `http://localhost:3000/campaign-studio`.

1. **Review Strategy Workspace**: Notice the high-density editorial layout (7/5 grid).
2. **Click "Ingest Campaign Results"**:
   - Enter sample performance metrics:
     - Impressions: `62,000`
     - Clicks: `2,850`
     - Redemptions: `520`
     - Spend: `$1,200`
   - Qualitative takeaway: *"Late night promo with free churro perk converted 20% higher than baseline"*.
3. **Click "Retain in Hindsight Cloud"**:
   - Watch the real-time modal trigger `client.aretain(...)`.
   - The system immediately runs a fresh session recall query to verify that the newly retained memory is queryable within 800ms.
   - The learning loop is closed!

### Stop 4: Campaign History (`/campaign-history`)
Open `http://localhost:3000/campaign-history`.
- Inspect past campaigns saved in SQLite with full metadata: provider (`Z.ai`), model (`glm-4.5-flash`), execution latency, and conversion statistics.

---

## 4. Automated Code & Integration Verification

To verify that all claims are backed by automated tests, run the complete pytest test suite:

```powershell
.\venv\Scripts\pytest.exe -v --tb=short backend/tests
```

### Expected Output: **39 Passed, 0 Failed, 0 Skipped**

Key test files to examine:
- `backend/tests/test_memory_cloud.py`: 5 live tests that connect to the real Vectorize Hindsight Cloud API (`aretain`, `arecall`, `areflect`, cross-session persistence, and brand bank isolation).
- `backend/tests/test_live_learning_e2e.py`: Complete end-to-end continuous learning loop (brief -> recall -> reflection -> strategy generation -> result ingestion -> retention -> verified fresh session recall).
- `backend/tests/test_memory_evolution.py`: 6 tests validating the Mode A vs. Mode B comparison endpoint and citation formatting.
- `backend/tests/test_campaign_api.py`: FastAPI campaign generation and results ingestion endpoints.

### Frontend Verification
```powershell
cd frontend
npm.cmd run typecheck
npm.cmd run lint
```
Expected output: **0 errors, 0 warnings**.

---

## 5. Security & Brand Isolation Verification

CampaignEcho strictly enforces 1:1 brand memory bank isolation:
```python
# Server-side deterministic mapping:
bank_id = f"campaignecho-brand-{str(brand_id).lower()}"
```

To verify that Brand B cannot read Brand A's memory bank:
1. Examine `backend/tests/test_memory_cloud.py::test_brand_isolation_real`.
2. This test creates a memory in `campaignecho-brand-test-isolation-a`, queries `campaignecho-brand-test-isolation-b`, and verifies that zero records cross the tenant boundary in the cloud response.

---

## 6. Band Desktop Integration Status

In accordance with our strict verification rules, we provide an honest, unvarnished status report on Band Desktop:
- **Test Runner Environment**: Windows 11 host.
- **Current CLI Status**: The `band` CLI executable is not in the system `PATH`.
- **Antigravity Status**: Antigravity IDE and subagent harnesses are fully functional.
- **Manual Verification Steps for Band Desktop**:
  If evaluating in an environment with Band Desktop installed:
  ```powershell
  band daemon status
  band doctor
  band project connect C:\CampaignEcho
  ```
  Detailed instructions and troubleshooting steps are documented in `docs/COMPETITION_COMPLIANCE.md`.

---

## 7. Direct Support & Contact

- **Lead Engineer**: Adarsh (`ahg8618364360-ctrl`)
- **Repository Issues**: `https://github.com/ahg8618364360-ctrl/CampaignEcho/issues`
- **Competition Track**: AI Agents That Learn Using Hindsight

