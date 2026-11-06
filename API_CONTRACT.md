# CampaignEcho REST API Contract

**Base URL**: `http://localhost:8000/api/v1`  
**Protocol**: REST / JSON over HTTP  
**Scope**: Local single-user development MVP (bound to localhost by default)  
**Validation Standard**: Pydantic v2 Models & FastAPI OpenAPI 3.1  
**Error Standard**: RFC 7807 Problem Details

---

## 1. System Health Endpoints

### `GET /health/live`
Verifies that the application process is running and able to handle HTTP requests.

#### Response (`200 OK`)
```json
{
  "status": "alive"
}
```

---

### `GET /health/ready`
Verifies that required backing services (the SQLite application database) are connected and ready to accept queries.
*(Note: Hindsight and Groq connections are not claimed as ready in Milestone 1).*

#### Response (`200 OK`)
```json
{
  "status": "ready",
  "database": "connected",
  "version": "0.1.0"
}
```

#### Error Response (`503 Service Unavailable`)
```json
{
  "status": "unready",
  "database": "disconnected",
  "detail": "Database connection pool unreachable"
}
```

---

## 2. Brand Management

### `POST /brands`
Create a new brand profile. The internal Hindsight memory bank mapping is provisioned server-side and is **never** exposed to the frontend client.

#### Request Body
```json
{
  "name": "The Taco Syndicate",
  "industry": "Fast-Casual Dining",
  "description": "Authentic street tacos, burritos, and Mexican sodas targeted at young adults.",
  "target_audience": "University students (18-24) within 3 miles, value-conscious, active late-night.",
  "market_region": "Austin, TX (West Campus)",
  "brand_voice": "Energetic, authentic, witty, zero pretension",
  "preferred_language": "en",
  "restrictions": "No high-end fine dining aesthetics; never offer alcohol discounts in student promos.",
  "is_synthetic": true
}
```

#### Response (`201 Created`)
```json
{
  "id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "name": "The Taco Syndicate",
  "industry": "Fast-Casual Dining",
  "description": "Authentic street tacos, burritos, and Mexican sodas targeted at young adults.",
  "target_audience": "University students (18-24) within 3 miles, value-conscious, active late-night.",
  "market_region": "Austin, TX (West Campus)",
  "brand_voice": "Energetic, authentic, witty, zero pretension",
  "preferred_language": "en",
  "restrictions": "No high-end fine dining aesthetics; never offer alcohol discounts in student promos.",
  "is_synthetic": true,
  "created_at": "2026-11-05T12:00:00Z",
  "updated_at": "2026-11-05T12:00:00Z"
}
```

---

### `GET /brands`
Retrieve all registered brands.

#### Response (`200 OK`)
```json
[
  {
    "id": "b0f7a264-8845-4279-9923-28f7311c1092",
    "name": "The Taco Syndicate",
    "industry": "Fast-Casual Dining",
    "campaign_count": 3,
    "is_synthetic": true,
    "created_at": "2026-11-05T12:00:00Z"
  }
]
```

---

## 3. Brand Memory Endpoints (Implemented in M2)

### `POST /brands/{brand_id}/memory/provision`
Idempotently creates or verifies the dedicated Hindsight memory bank for the brand. In accordance with ADR-002, the underlying bank identifier is managed strictly server-side and is never exposed in public client responses.

#### Response (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "bank_provisioned": true,
  "status": "PROVISIONED",
  "message": "Memory bank provisioned or verified successfully",
  "created_at": "2026-11-06T11:30:00Z"
}
```

---

### `POST /brands/{brand_id}/memory/retain`
Retains durable marketing experiences, campaign outcomes, or audience feedback into the brand's memory bank using native async `aretain`.

#### Request Body
```json
{
  "content": "Late-night BOGO burrito promotions after 9 PM drove 380 redemptions with university students, whereas lunch promos failed.",
  "context": "campaign_outcome",
  "campaign_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "source_type": "CAMPAIGN_POSTMORTEM",
  "is_synthetic": true,
  "metadata": {
    "target_segment": "students_18_24",
    "redemptions": "380"
  },
  "tags": ["bogo", "late_night", "synthetic"]
}
```

#### Response (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "operation_id": "op_01hqz...",
  "status": "SUCCESS",
  "items_retained": 1,
  "duration_ms": 142,
  "is_synthetic": true,
  "source_type": "CAMPAIGN_POSTMORTEM",
  "recorded_at": "2026-11-06T11:30:00Z",
  "message": "Campaign experience retained in Hindsight memory."
}
```

---

### `POST /brands/{brand_id}/memory/recall`
Contextually queries the brand's memory bank using native async `arecall` (semantic vector, BM25, and temporal proximity).

#### Request Body
```json
{
  "query": "What promotions drive foot traffic with college students?",
  "budget": "mid",
  "max_tokens": 4096,
  "tags": ["bogo"],
  "tags_match": "any"
}
```

#### Response (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "query": "What promotions drive foot traffic with college students?",
  "results": [
    {
      "id": "mem_01hqz...",
      "content": "Late-night BOGO burrito promotions after 9 PM drove 380 redemptions...",
      "memory_type": "observation",
      "score": 0.92,
      "tags": ["bogo", "late_night", "synthetic"],
      "metadata": {
        "target_segment": "students_18_24"
      },
      "timestamp": "2026-11-06T11:30:00Z"
    }
  ],
  "total_results": 1,
  "duration_ms": 88,
  "provenance": {
    "engine": "Vectorize Hindsight",
    "budget": "mid",
    "tags_match": "any"
  }
}
```

---

### `POST /brands/{brand_id}/memory/reflect`
Synthesizes higher-order strategic patterns across historical memories using native async `areflect`.

#### Request Body
```json
{
  "query": "What creative angles deliver the highest conversion rates for late-night promos?",
  "budget": "low",
  "tags": ["late_night"]
}
```

#### Response (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "query": "What creative angles deliver the highest conversion rates for late-night promos?",
  "reflection": "Historical data demonstrates that student audiences respond strongly to late-night urgency hooks...",
  "duration_ms": 320,
  "facts": [
    {
      "fact": "Late-night BOGO promos drove 380 redemptions after 9 PM."
    }
  ]
}
```

---

### `GET /brands/{brand_id}/memory/status`
Queries engine health and verification status for the brand's memory bank without disclosing internal credentials or bank identifiers. Unknown memory counts use `null`.

#### Response (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "bank_provisioned": true,
  "service_connected": true,
  "engine_status": "CONNECTED",
  "version": "1.1.0",
  "message": "Memory bank is provisioned and active on Hindsight v1.1.0.",
  "memories_count": 12,
  "last_verified": "2026-11-06T11:30:00Z"
}
```

#### Unconfigured/Unprovisioned State (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "bank_provisioned": false,
  "service_connected": true,
  "engine_status": "CONNECTED",
  "version": "1.1.0",
  "message": "Hindsight Cloud requires authentication. Configure HINDSIGHT_API_KEY in .env to provision and access bank.",
  "memories_count": null,
  "last_verified": "2026-11-06T11:30:00Z"
}
```

---

### `GET /brands/{brand_id}/memory/activity?limit=10`
Retrieves privacy-safe operational telemetry from the SQLite `memory_logs` table.

#### Response (`200 OK`)
```json
{
  "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
  "activities": [
    {
      "id": "1",
      "brand_id": "b0f7a264-8845-4279-9923-28f7311c1092",
      "operation_type": "RETAIN",
      "context_tag": "CAMPAIGN_POSTMORTEM",
      "items_count": 1,
      "status": "SUCCESS",
      "latency_ms": 142,
      "created_at": "2026-11-06T11:30:00Z"
    }
  ],
  "total_count": 1
}
```

---

## 4. Campaign Orchestration & Evolution (Scheduled for M3 - M5)

### `POST /campaigns/generate` (Scheduled for M3)
Generate a structured, memory-backed marketing strategy for a brand brief.

### `POST /campaigns/{id}/results` (Scheduled for M3)
Record actual performance data and qualitative review, triggering native Hindsight `aretain`.

### `POST /campaigns/compare` (Scheduled for M5)
Executes parallel generations: Mode A (Zero-Memory) vs. Mode B (Hindsight Memory-Powered).
Comparison metrics rely strictly on verifiable evidence, brand-rule compliance, and specific past-mistake avoidance—**no fake or AI self-graded percentage scores**.

---

## 4. Privacy-Safe Memory Telemetry

### `GET /memory/timeline?brand_id={id}` (Scheduled for M4)
Returns operational telemetry (`operation_type`, `context_tag`, `items_count`, `latency_ms`, `created_at`) without exposing raw, confidential conversational contents.
