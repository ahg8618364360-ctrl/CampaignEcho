import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


def generate_uuid() -> str:
    """Generate string UUIDv4."""
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    """Get timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


class User(Base):
    """User account entity for multi-user authentication."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    brands = relationship("Brand", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    """Server-side revocable session for multi-user authentication."""

    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")


class Brand(Base):
    """Brand profile / business workspace entity."""

    __tablename__ = "brands"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    target_audience = Column(Text, nullable=False)
    market_region = Column(String(100), nullable=False)
    brand_voice = Column(String(100), nullable=False)
    preferred_language = Column(String(20), default="en", nullable=False)
    restrictions = Column(Text, nullable=True)

    # Extended business profile metadata
    is_archived = Column(Boolean, default=False, nullable=False)
    website = Column(String(255), nullable=True)
    instagram_handle = Column(String(100), nullable=True)
    products_or_services = Column(Text, nullable=True)
    unique_selling_points = Column(Text, nullable=True)
    price_range = Column(String(50), nullable=True)
    key_offers = Column(Text, nullable=True)
    competitors = Column(Text, nullable=True)
    
    # Internal backend Hindsight bank identifier (campaignecho-brand-{id})
    # Nullable in M1, populated during M2 bank provisioning
    hindsight_bank_id = Column(String(128), unique=True, nullable=True)
    is_synthetic = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="brands")
    campaigns = relationship("Campaign", back_populates="brand", cascade="all, delete-orphan")
    memory_logs = relationship("MemoryLog", back_populates="brand", cascade="all, delete-orphan")
    verification_runs = relationship("MemoryVerificationRun", back_populates="brand", cascade="all, delete-orphan")
    comparisons = relationship("CampaignComparison", back_populates="brand", cascade="all, delete-orphan")


class Campaign(Base):
    """Campaign strategy record."""

    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    brief = Column(Text, nullable=False)
    objective = Column(String(100), nullable=False)
    platform = Column(String(50), nullable=False)
    status = Column(String(30), default="DRAFT", nullable=False)
    is_synthetic = Column(Boolean, default=False, nullable=False)
    memory_enabled = Column(Boolean, default=True, nullable=False)

    concept_data = Column(JSON, nullable=True)
    strategy_output = Column(JSON, nullable=True)
    llm_provider = Column(String(50), nullable=True)
    llm_model = Column(String(100), nullable=True)

    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    brand = relationship("Brand", back_populates="campaigns")
    metrics = relationship("CampaignMetrics", back_populates="campaign", uselist=False, cascade="all, delete-orphan")
    feedback = relationship("CampaignFeedback", back_populates="campaign", cascade="all, delete-orphan")


class CampaignMetrics(Base):
    """Quantitative performance metrics filed after campaign execution."""

    __tablename__ = "campaign_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), unique=True, nullable=False)

    budget = Column(Numeric(10, 2), nullable=True)
    spend = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default="USD", nullable=False)

    # Nullable to prevent confusing unknown observations with true zero performance
    impressions = Column(Integer, nullable=True)
    reach = Column(Integer, nullable=True)
    clicks = Column(Integer, nullable=True)
    conversions = Column(Integer, nullable=True)
    offer_redemptions = Column(Integer, nullable=True)

    cost_per_acquisition = Column(Numeric(10, 2), nullable=True)
    roas = Column(Numeric(10, 2), nullable=True)
    primary_kpi = Column(String(50), nullable=False)
    reported_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="metrics")


class CampaignFeedback(Base):
    """Qualitative review and lessons learned from past campaigns."""

    __tablename__ = "campaign_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    feedback_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    lessons_learned = Column(Text, nullable=False)

    retained_to_hindsight = Column(Boolean, default=False, nullable=False)
    hindsight_memory_id = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="feedback")


class MemoryLog(Base):
    """Privacy-safe operational telemetry for memory interactions."""

    __tablename__ = "memory_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    operation_type = Column(String(20), nullable=False)  # RETAIN, RECALL, REFLECT
    context_tag = Column(String(100), nullable=True)
    items_count = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="SUCCESS", nullable=False)
    latency_ms = Column(Integer, nullable=False)
    verification_run_id = Column(String(64), nullable=True, index=True)
    is_live = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    brand = relationship("Brand", back_populates="memory_logs")


class MemoryVerificationRun(Base):
    """Explicit, auditable record for a correlated memory operations verification run.
    
    OPERATIONS_VERIFIED requires all 3 operations (RETAIN, RECALL, REFLECT) to succeed
    against the verified brand bank within the SAME live run.
    """

    __tablename__ = "memory_verification_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    verification_run_id = Column(String(64), unique=True, nullable=False, index=True)
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    retain_success = Column(Boolean, default=False, nullable=False)
    recall_success = Column(Boolean, default=False, nullable=False)
    reflect_success = Column(Boolean, default=False, nullable=False)
    is_live = Column(Boolean, default=True, nullable=False)
    status = Column(String(30), default="IN_PROGRESS", nullable=False)  # IN_PROGRESS, VERIFIED, FAILED
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    brand = relationship("Brand", back_populates="verification_runs")


class CampaignComparison(Base):
    """Controlled A/B comparison between baseline strategy (Mode A) and memory-powered strategy (Mode B).
    
    Demonstrates CampaignEcho's signature feature: how Vectorize Hindsight memory changes
    the generated campaign strategy when brief, model, and parameters are kept strictly identical.
    """

    __tablename__ = "campaign_comparisons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    
    # Input brief data
    campaign_brief = Column(JSON, nullable=False)
    
    # Generated outputs
    baseline_strategy = Column(JSON, nullable=False)  # Mode A: Without Historical Memory
    memory_strategy = Column(JSON, nullable=False)    # Mode B: With Hindsight Memory
    
    # LLM execution provenance (strictly identical across both modes)
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    generation_parameters = Column(JSON, nullable=False)
    prompt_version = Column(String(50), default="v1.0", nullable=False)
    
    # Statuses
    baseline_status = Column(String(30), default="COMPLETED", nullable=False)
    memory_status = Column(String(30), default="COMPLETED", nullable=False)
    
    # Memory Context (retrieved Hindsight items & reflections)
    retrieved_memory_references = Column(JSON, nullable=True)
    reflection_metadata = Column(JSON, nullable=True)
    
    # Verifiable comparison differences (no fake percentage scores)
    comparison_summary = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    brand = relationship("Brand", back_populates="comparisons")


