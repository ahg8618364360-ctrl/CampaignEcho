# CampaignEcho System Architecture & Technical Specification

**Category**: AI Marketing Intelligence Platform  
**Core Motto**: *"Every campaign teaches the next."*  
**Core Thesis**: Conventional AI marketing assistants produce generic content because they have no persistent brand memory. CampaignEcho continuously accumulates, recalls, and reflects upon brand-specific campaign results, audience preferences, and client feedback via Vectorize Hindsight.

---

## 1. System Overview & Component Diagram

```mermaid
flowchart TD
    subgraph Client["Next.js 15+ Frontend (Port 3000)"]
        UI_Shell["App Shell & Navigation"]
        UI_Overview["Overview Dashboard (/)"]
        UI_Brands["Brand Profiles (/brands)"]
        UI_Studio["Campaign Studio (/campaign-studio)"]
        UI_History["Campaign History (/campaign-history)"]
        UI_Memory["Memory Explorer (/memory-explorer)"]
        UI_Evol["Memory Evolution View (/memory-evolution)"]
        UI_Settings["Settings (/settings)"]
    end

    subgraph Backend["FastAPI Backend Service (Port 8000, Localhost)"]
        Router["FastAPI APIRouter (/api/v1)"]
        HealthController["Health Controller (/health/live, /health/ready)"]
        BrandService["Brand Management Service"]
        CampaignService["Campaign Orchestrator"]
        MemoryService["Hindsight Async Memory Adapter"]
        LLMService["Groq LLM Intelligence Engine"]
        DB[(SQLite / SQLAlchemy 2.0 ORM)]
    end

    subgraph External["External Intelligence Services"]
        Hindsight["Vectorize Hindsight Engine / Cloud\n(Native aretain, arecall, areflect)"]
        Groq["Groq Cloud API\n(Llama 3.3 70B / Mixtral)"]
    end

    Client -->|REST / JSON| Router
    Router --> HealthController
    Router --> BrandService
    Router --> CampaignService
    
    HealthController --> DB
    BrandService --> DB
    BrandService -->|Provision Bank| MemoryService
    
    CampaignService --> DB
    CampaignService -->|Async Recall & Reflect| MemoryService
    CampaignService -->|Synthesize Strategy| LLMService
    CampaignService -->|Async Retain Outcome| MemoryService

    MemoryService -->|HTTP / Async SDK| Hindsight
    LLMService -->|REST| Groq
```

---

## 2. Component Responsibility Division

### A. Application Database (SQLite via SQLAlchemy 2.0)
Stores relational, transactional, and audit data:
- `brands`: Brand metadata (name, industry, voice, target audience, restrictions, internal Hindsight bank ID, synthetic flag).
- `campaigns`: Campaign briefs, generated concepts, suggested platforms, status, synthetic flag, memory enabled flag.
- `campaign_metrics`: Quantitative performance metrics with decimal-safe financial fields (`NUMERIC(10,2)`), ISO currency, and nullable counts for unknown metrics.
- `campaign_feedback`: Qualitative feedback (client notes, audience response, lessons learned).
- `memory_logs`: Safe telemetry of memory operations (timestamp, operation type, context tag, item counts, latency).

### B. Memory Engine (Vectorize Hindsight)
Stores unstructured, durable, and semantic long-term memory:
- **`aretain`**: Consolidates durable brand facts, verified creative successes, documented failures, and qualitative constraints using native async calls.
- **`arecall`**: Multi-strategy context retrieval (BM25 keyword search, vector semantic similarity, temporal proximity, and graph traversal).
- **`areflect`**: Higher-order synthesis across historical campaigns (e.g., *"What creative angles have consistently delivered the lowest cost per acquisition for college students in this restaurant?"*).
- **Fallback Policy**: Real Vectorize Hindsight is required for memory claims. The system will never silently substitute a local database lookup and pretend it represents a Hindsight memory operation.

### C. LLM Engine (Groq Cloud)
Fast, structured inference provider:
- Operates on prompt templates receiving Brand Profile + Recalled Hindsight Memories + Hindsight Reflection + Current Campaign Brief.
- Returns strictly typed JSON strategies conforming to Pydantic schemas.

---

## 3. Brand Memory Isolation & Bank Lifecycle

1. **Deterministic Bank ID**:
   ```python
   bank_id = f"campaignecho-brand-{brand_id}"
   ```
2. **Idempotent Bank Provisioning**:
   - Managed server-side. Bank IDs are stored in `brands.hindsight_bank_id` and never exposed in client API responses.
3. **Tenant Boundary Enforcement**:
   - In this single-user MVP, all requests are bound to localhost.
   - The backend validates that all recall and retain requests strictly target the bank mapped to the selected `brand_id`.

---

## 4. End-to-End Campaign Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Marketer / User
    participant Studio as Campaign Studio (Next.js)
    participant API as FastAPI Backend
    participant Hindsight as Vectorize Hindsight
    participant Groq as Groq LLM
    participant DB as SQLite DB

    User->>Studio: Enter Campaign Brief
    Studio->>API: POST /api/v1/campaigns/generate (brand_id, brief)
    API->>DB: Fetch Brand Profile
    API->>Hindsight: arecall(bank_id, query=brief)
    Hindsight-->>API: Recalled Memories
    API->>Hindsight: areflect(bank_id, query="What worked best for students?")
    Hindsight-->>API: Reflection Synthesis
    API->>Groq: Generate Strategy (Prompt with Brand + Memories + Reflection)
    Groq-->>API: Structured JSON Strategy with Memory Citations
    API->>DB: Save Campaign Record
    API-->>Studio: Render Strategy & Memory Citations Deck
    
    Note over User,Studio: Campaign Executes in Real Life
    User->>Studio: Submit Campaign Results & Client Feedback
    Studio->>API: POST /api/v1/campaigns/{id}/results (metrics, feedback)
    API->>DB: Save Metrics & Feedback
    API->>Hindsight: aretain(bank_id, content="Student promo achieved 412 redemptions...")
    Hindsight-->>API: Stored & Consolidated
    API-->>Studio: Feedback Retained Confirmation
```
