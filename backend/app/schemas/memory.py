from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class MemoryItem(BaseModel):
    """Retrieved memory unit representation."""

    id: Optional[str] = None
    content: str
    memory_type: Optional[str] = None
    score: Optional[float] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[str] = None


class BankProvisionRequest(BaseModel):
    """Request to provision a persistent Hindsight bank for a brand."""

    name: Optional[str] = None
    mission: Optional[str] = None
    retain_mission: Optional[str] = None
    reflect_mission: Optional[str] = None


class BankProvisionResponse(BaseModel):
    """Response confirming bank provisioning status without leaking internal bank ID."""

    brand_id: str
    bank_provisioned: bool = True
    status: Literal["PROVISIONED", "ALREADY_EXISTS", "FAILED", "NOT_CONFIGURED"]
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MemoryRetainRequest(BaseModel):
    """Request to retain a brand rule, campaign takeaway, or feedback into memory."""

    content: str = Field(..., min_length=3, description="Strategic takeaway or observation to store")
    context: Optional[str] = Field(None, description="Contextual background or scenario")
    document_id: Optional[str] = Field(None, description="Unique source document ID for deduplication")
    metadata: Dict[str, str] = Field(default_factory=dict, description="Metadata key-value pairs")
    tags: List[str] = Field(default_factory=list, description="Categorical tags for retrieval")
    entities: Optional[List[Dict[str, str]]] = Field(None, description="Named entities mentioned")
    is_synthetic: bool = Field(False, description="Flag explicitly indicating if this is demo fixture data")
    source_type: str = Field("CAMPAIGN_POSTMORTEM", description="Data provenance classification")
    campaign_id: Optional[str] = Field(None, description="Originating campaign identifier if applicable")
    verification_run_id: Optional[str] = Field(None, description="Correlation identifier for verification run")


class MemoryRetainResponse(BaseModel):
    """Response returned upon memory retention."""

    brand_id: str
    operation_id: Optional[str] = None
    status: Literal["SUCCESS", "FAILED", "OFFLINE_SIMULATED"]
    items_retained: int = 1
    duration_ms: int
    is_synthetic: bool
    source_type: str
    verification_run_id: Optional[str] = None
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message: str


class MemoryRecallRequest(BaseModel):
    """Request to recall historical memories relevant to a query."""

    query: str = Field(..., min_length=2, description="Semantic search query or campaign context")
    types: Optional[List[str]] = Field(None, description="Memory unit types to retrieve")
    budget: Literal["low", "mid", "high"] = Field("mid", description="Recall depth/token budget")
    max_tokens: int = Field(4096, ge=128, le=16384)
    tags: Optional[List[str]] = Field(None, description="Tags to filter by")
    tags_match: Literal["any", "all", "exact"] = Field("any", description="Tag matching strategy")
    verification_run_id: Optional[str] = Field(None, description="Correlation identifier for verification run")


class MemoryRecallResponse(BaseModel):
    """Response containing retrieved memories and source evidence."""

    brand_id: str
    query: str
    results: List[MemoryItem] = Field(default_factory=list)
    total_results: int
    duration_ms: int
    verification_run_id: Optional[str] = None
    provenance: Dict[str, Any] = Field(default_factory=dict)


class MemoryReflectRequest(BaseModel):
    """Request to synthesize higher-order strategic reflections from stored memories."""

    query: str = Field(..., min_length=3, description="Reflective question e.g. What worked for this audience?")
    budget: Literal["low", "mid", "high"] = Field("low", description="Reflection token budget")
    context: Optional[str] = Field(None, description="Current campaign context")
    tags: Optional[List[str]] = Field(None, description="Tags to scope reflection")
    verification_run_id: Optional[str] = Field(None, description="Correlation identifier for verification run")


class MemoryReflectResponse(BaseModel):
    """Response containing synthesized reflection and facts."""

    brand_id: str
    query: str
    reflection: str
    duration_ms: int
    verification_run_id: Optional[str] = None
    facts: List[Dict[str, Any]] = Field(default_factory=list)


class MemoryStatusResponse(BaseModel):
    """Live connectivity and readiness status of the brand's memory bank."""

    brand_id: str
    service_state: Literal[
        "NOT_CONFIGURED",
        "ENDPOINT_UNREACHABLE",
        "AUTH_REQUIRED",
        "AUTHENTICATED",
        "BANK_NOT_PROVISIONED",
        "BANK_PROVISIONED",
        "OPERATIONS_VERIFIED",
    ] = "NOT_CONFIGURED"
    bank_provisioned: bool = False
    service_connected: bool = False
    engine_status: str = "NOT_CONFIGURED"
    version: Optional[str] = None
    message: str
    memories_count: Optional[int] = None
    has_api_key: bool = False
    verification_run_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    last_verified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MemoryActivityItem(BaseModel):
    """Operational telemetry entry for memory operations."""

    id: str
    brand_id: str
    operation_type: str
    context_tag: Optional[str] = None
    items_count: int
    status: str
    latency_ms: int
    created_at: datetime


class MemoryActivityResponse(BaseModel):
    """List of recent memory telemetry logs."""

    brand_id: str
    activities: List[MemoryActivityItem] = Field(default_factory=list)
    total_count: int

