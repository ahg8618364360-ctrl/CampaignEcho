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
  "restrictions": "No high-end fine dining aesthetics; never offer alcohol discounts in student promos."
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
  "is_synthetic": false,
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

## 3. Campaign Orchestration & Evolution

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
