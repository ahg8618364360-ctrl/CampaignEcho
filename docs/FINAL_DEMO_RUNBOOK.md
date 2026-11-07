# CampaignEcho — 60-Second Evaluator Demo Runbook

**System**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Memory Engine**: Vectorize Hindsight Cloud (`api.hindsight.vectorize.io`)  
**LLM Engine**: Z.ai GLM-4.5-Flash (Production Active Provider; Groq Failover Disabled)  
**Target Audience**: Judges, Technical Evaluators, and Marketing Executives  
**Target Duration**: 60–90 Seconds

---

## Pre-Flight Checklist (10 Seconds Before Demo)

Ensure the backend and frontend services are running:
- **FastAPI Backend**: `http://127.0.0.1:8000` (Verify: `GET /api/v1/health/ready` returns `{"status":"ready","database":"connected"}`)
- **Next.js Frontend**: `http://localhost:3000`
- **Hindsight Cloud Status**: Verified `OPERATIONS_VERIFIED` in `Settings` or `GET /api/v1/brands/{brand_id}/memory/status`

```bash
# Optional: Run test suite to verify 100% test pass rate
pytest -v backend/tests
# Result: 35 passed in ~35s (including all 5 live Hindsight Cloud integration tests and live E2E)
```

---

## 60-Second Live Demonstration Script

### Act 1: The Cold-Start Memory Baseline (0:00 - 0:15)
1. **Navigate**: Open browser to `http://localhost:3000/campaign-studio`.
2. **Select Brand**: Choose **The Taco Syndicate** (Late-night urban street food brand).
3. **Show Grounding Desk**: Point to the right-hand panel (**Memory Grounding Desk**).
   - *Highlight*: "Notice that CampaignEcho connects directly to Vectorize Hindsight Cloud. It inspects the tenant's dedicated brand memory bank (protected server-side). The engine is actively verified with live operational telemetry."
4. **Point to Historical Memories**: Note the brand's prior learnings stored in Hindsight:
   - *Observation*: "11 PM - 1 AM Friday/Saturday drive peak redemptions."
   - *Observation*: "Audio-first ASMR food prep clips of cheese pull convert 3.2x higher than talking heads."

### Act 2: Memory-Grounded Strategy Generation (0:15 - 0:35)
1. **Input Campaign Brief**:
   - **Campaign Goal**: "Launch Weekend Midnight Stash Run promo targeting college night owls."
   - **Target Audience**: "Urban college students & nightlife crowd within 3 miles."
   - **Budget**: `$1,500.00`
   - **LLM Engine**: Z.ai GLM-4.5-Flash (Active Production Provider).
2. **Click "Generate Memory-Grounded Strategy"**:
   - Watch the generation trigger:
     1. Hindsight `arecall` retrieves semantically relevant historical campaign memories.
     2. Hindsight `areflect` synthesizes high-level brand patterns and behavioral heuristics.
     3. Reasoner LLM (`glm-4.5-flash` via Z.ai) generates structured executive strategy.
3. **Inspect Output**:
   - **Epistemic Triad**: Point out that the agent cleanly separates **Observed Facts** (empirical historical metrics) from **Strategic Inferences**, **Actionable Recommendations**, and **Uncertainties**. Zero false causality!
   - **Short-Form Reel Concepts**: Note the generated creative angles (e.g., *The Midnight Sizzle & Queso Drop*).
   - **Memory Citation Chips**: Click on the citation chips (e.g., `[Hindsight Cloud · dcc1eac9]`) showing exactly which historical Hindsight memory informed the angle and timing.

### Act 3: Closing the Learning Loop — Results & Instant Retain (0:35 - 0:50)
1. **Click "Submit Results & Close Loop"**:
   - The **Performance Results Drawer** opens.
2. **Ingest Real Performance Data**:
   - **Impressions / Reach**: `48,200`
   - **Total Clicks / Engagements**: `1,820`
   - **Conversions / Redemptions**: `389`
   - **Actual Spend**: `$1,150.00`
   - **What Worked**: "Sizzling carnitas food-prep sound and queso pour clips converted 3.1x higher than talking heads."
   - **What Failed**: "Static graphics completely underperformed dynamic video."
   - **Key Strategic Lesson**: "Audio-first ASMR food prep of queso pour drove 389 flash redemptions; keep talking-head hooks under 2 seconds."
3. **Click "Retain & Verify Closed Loop"**:
   - The backend:
     1. Ingests metrics and records them into SQLite `campaign_metrics`.
     2. Automatically formats an executive postmortem memory document.
     3. Executes Hindsight `aretain` directly to Vectorize Hindsight Cloud.
     4. Executes immediate Hindsight `arecall` to actively verify that the newly stored memory is immediately retrievable.
4. **Show Success State**:
   - The green confirmation banner displays:
     - **Retain Op ID**: Real Hindsight operation identifier (e.g., `ret-39c2...`).
     - **Verified Retrieval**: `PASSED`.
     - **Bank**: Dedicated Brand Bank (Managed Server-Side).

### Act 4: The Compounding Intelligence Proof (0:50 - 1:00)
1. **Navigate to Memory Explorer**: Click **Memory Explorer** in the left sidebar (`/memory-explorer`).
2. **Show Live Recalled Memories**:
   - The verified status banner confirms Vectorize Hindsight Cloud connection (`OPERATIONS_VERIFIED`).
   - Switch between **[Live Hindsight Cloud Bank]** (14 real cloud memories with UUIDs) and **[Demonstration Fixtures]**.
   - Show the newly retained campaign postmortem appearing in the live activity stream.
3. **Conclusion / Punchline**:
   - "Every campaign executed on CampaignEcho makes the next campaign smarter. The AI agent never starts from scratch, never repeats past mistakes, and grounds every creative recommendation in empirical memory banks powered by Vectorize Hindsight."

---

## Technical Troubleshooting Quick Reference

| Issue | Quick Fix |
| :--- | :--- |
| **Backend Unreachable** | Run `.\venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000` |
| **Frontend Unreachable** | Run `cd frontend && npm start` (or `npm run dev`) |
| **Hindsight Auth Issue** | Confirm `HINDSIGHT_API_KEY` is present in root `.env` |
| **LLM Inference** | Primary engine is Z.ai GLM-4.5-Flash (free, fast reasoning model at `open.bigmodel.cn`) |
