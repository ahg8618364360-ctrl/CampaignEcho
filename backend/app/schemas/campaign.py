from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class MemoryCitation(BaseModel):
    """Memory evidence cited by the campaign strategy."""
    memory_id: Optional[str] = Field(None, description="Hindsight memory ID or document reference")
    observation: str = Field(..., description="Exact historical observation or pattern recorded in memory")
    category: str = Field(
        ...,
        description="Epistemological classification: OBSERVED_FACT, HISTORICAL_PATTERN, or PRIOR_HYPOTHESIS"
    )
    provenance: str = Field(
        ...,
        description="Source provenance: Vectorize Hindsight Cloud, Synthetic Fixture, Campaign Postmortem"
    )
    is_synthetic: bool = Field(False, description="Whether this evidence stems from a synthetic fixture")
    relevance_score: Optional[float] = Field(None, description="Semantic match relevance or confidence")


class ReelConcept(BaseModel):
    """Structured short-form video concept (Reel / TikTok / Short)."""
    concept_title: str = Field(..., description="Short creative name for the concept")
    hook: str = Field(..., description="First 3 seconds verbal and visual hook")
    visual_direction: str = Field(..., description="Framing, pacing, lighting, and visual cues")
    script_or_caption: str = Field(..., description="Narrative audio script or on-screen text sequence")
    call_to_action: str = Field(..., description="Actionable closing CTA")
    supporting_memory_id: Optional[str] = Field(None, description="Hindsight memory ID inspiring this direction")
    supporting_memory_quote: Optional[str] = Field(None, description="Specific historical lesson referenced")


class EpistemicTriad(BaseModel):
    """Strict separation of observed reality, causal inference, and proposed action."""
    observed_facts: List[str] = Field(
        default_factory=list,
        description="What the recorded Hindsight evidence empirically confirms."
    )
    strategic_inferences: List[str] = Field(
        default_factory=list,
        description="What the AI hypothesizes or deduces from historical patterns."
    )
    actionable_recommendations: List[str] = Field(
        default_factory=list,
        description="Concrete steps proposed for execution in this campaign."
    )
    unresolved_uncertainties: List[str] = Field(
        default_factory=list,
        description="Questions where current memory evidence is insufficient or absent."
    )


class CampaignBriefInput(BaseModel):
    """Structured campaign brief provided by the marketer."""
    brand_id: str = Field(..., description="Target brand identifier")
    name: str = Field(..., min_length=2, max_length=255, description="Campaign title")
    objective: str = Field(..., description="Primary campaign objective (e.g. Foot Traffic, Awareness, Conversions)")
    target_audience: Optional[str] = Field(None, description="Specific demographic or psychographic segment")
    platform: str = Field(..., description="Primary social platform (e.g. Instagram Reels, TikTok, YouTube Shorts)")
    content_language: str = Field("en", description="Language for campaign copy and reels")
    geographic_market: Optional[str] = Field(None, description="Target city, region, or market")
    budget: Optional[float] = Field(None, ge=0, description="Total budget in brand currency")
    primary_kpi: Optional[str] = Field(None, description="Primary performance metric (e.g. Redemptions, CTR, CPA)")
    offer_or_promotion: Optional[str] = Field(None, description="Promotional mechanic or incentive (e.g. BOGO, 20% Off)")
    constraints: Optional[str] = Field(None, description="Brand voice guidelines or explicit restrictions")
    duration_days: Optional[int] = Field(None, ge=1, le=365, description="Planned runtime in days")
    preferred_format: Optional[str] = Field(None, description="Preferred format (e.g. Short-Form Video, Carousels)")
    is_synthetic: bool = Field(False, description="Flag for synthetic simulation runs")


class CampaignStrategyOutput(BaseModel):
    """Full marketing intelligence strategy generated with grounded memory synthesis."""
    campaign_concept: str = Field(..., description="Core overarching campaign hook and thesis")
    main_objective: str = Field(..., description="Revalidated strategic objective")
    target_audience: str = Field(..., description="Refined audience profile for this execution")
    campaign_positioning: str = Field(..., description="Market positioning vs competitive alternatives")
    creative_direction: str = Field(..., description="Visual aesthetic, tone, color palette, pacing")
    reel_concepts: List[ReelConcept] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Detailed short-form video execution concepts"
    )
    content_formats: List[str] = Field(default_factory=list, description="Recommended production formats")
    caption_directions: List[str] = Field(default_factory=list, description="Copywriting frameworks and caption guidelines")
    suggested_hooks: List[str] = Field(default_factory=list, description="Standout copy hooks for headlines and ads")
    platform_specific_execution: str = Field(..., description="Platform native mechanics (audio, hashtags, algorithms)")
    offer_recommendations: str = Field(..., description="Pricing, promotion, or offer structure")
    call_to_action: str = Field(..., description="Primary conversion driver")
    kpi_recommendations: List[str] = Field(default_factory=list, description="Primary and secondary metrics to track")
    execution_timeline: List[str] = Field(default_factory=list, description="Phased launch timeline")
    potential_risks: List[str] = Field(default_factory=list, description="Identified failure modes to mitigate")
    historical_rationale: str = Field(..., description="How past Hindsight experiences shaped this strategy")
    memory_citations: List[MemoryCitation] = Field(
        default_factory=list,
        description="Explicit memory items cited in this strategy"
    )
    epistemic_triad: EpistemicTriad = Field(
        default_factory=EpistemicTriad,
        description="Factual observations, inferences, recommendations, and uncertainties"
    )
    hindsight_reflection_summary: Optional[str] = Field(
        None,
        description="Summary of Vectorize Hindsight reflect operation that informed this strategy"
    )
    llm_provider: str = Field(..., description="Actual LLM provider used (e.g. zai, groq)")
    llm_model: str = Field(..., description="Specific model utilized (e.g. glm-4.5-flash)")
    fallback_used: bool = Field(False, description="Whether automatic provider fallback occurred")
    generated_at: datetime = Field(default_factory=lambda: datetime.now())


class CampaignMetricsResponse(BaseModel):
    """Quantitative performance metrics filed for a campaign."""
    id: str
    campaign_id: str
    budget: Optional[float] = None
    spend: Optional[float] = None
    currency: str = "USD"
    impressions: Optional[int] = None
    reach: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    offer_redemptions: Optional[int] = None
    cost_per_acquisition: Optional[float] = None
    roas: Optional[float] = None
    primary_kpi: str
    reported_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CampaignFeedbackResponse(BaseModel):
    """Qualitative review and lessons learned."""
    id: str
    campaign_id: str
    feedback_type: str
    content: str
    lessons_learned: str
    retained_to_hindsight: bool
    hindsight_memory_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CampaignResponse(BaseModel):
    """Complete campaign strategy record."""
    id: str
    brand_id: str
    name: str
    brief: str
    objective: str
    platform: str
    status: str
    is_synthetic: bool
    memory_enabled: bool
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
    strategy_output: Optional[CampaignStrategyOutput] = None
    metrics: Optional[CampaignMetricsResponse] = None
    feedback: List[CampaignFeedbackResponse] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CampaignResultSubmission(BaseModel):
    """Submission payload to record campaign performance and close the Hindsight learning loop."""
    reporting_period: Optional[str] = Field(None, description="e.g. 'Oct 2026 Weekend Flash'")
    impressions: Optional[int] = Field(None, ge=0, description="Total observed impressions")
    reach: Optional[int] = Field(None, ge=0, description="Unique audience reached")
    clicks: Optional[int] = Field(None, ge=0, description="Observed link or profile clicks")
    conversions: Optional[int] = Field(None, ge=0, description="Purchases or signups")
    offer_redemptions: Optional[int] = Field(None, ge=0, description="Promo code / coupon redemptions")
    spend: Optional[float] = Field(None, ge=0, description="Total ad or campaign spend")
    revenue: Optional[float] = Field(None, ge=0, description="Attributed revenue")
    client_feedback: Optional[str] = Field(None, description="Qualitative stakeholder feedback or audience response")
    observations: Optional[str] = Field(None, description="Field observations, qualitative phenomena")
    lessons_learned: str = Field(..., min_length=10, description="Core actionable takeaways to retain in Hindsight memory")
    is_synthetic: bool = Field(False, description="Flag indicating if these results are synthetic demo fixtures")


class LearningLoopClosedResponse(BaseModel):
    """Confirmation response indicating campaign results were saved and retained into Hindsight."""
    campaign_id: str
    brand_id: str
    hindsight_bank_id: str
    metrics_recorded: bool
    retained_to_hindsight: bool
    retained_memory_content: str
    hindsight_retain_operation_id: Optional[str] = None
    hindsight_recalled_verification: bool = False
    verified_retrieval_query: Optional[str] = None
    message: str
    timestamp: datetime


class ComparisonDimensionCheck(BaseModel):
    """Verifiable dimension comparison without fake percentage scores."""
    dimension: str = Field(..., description="Evaluation dimension identifier")
    label: str = Field(..., description="Human-readable dimension name")
    mode_a_result: str = Field(..., description="Mode A (Zero Memory) result")
    mode_b_result: str = Field(..., description="Mode B (Hindsight Memory) result")
    detail: str = Field(..., description="Verifiable empirical difference")
    is_grounded: bool = Field(True, description="Whether this difference is grounded in verifiable evidence")


class ComparisonSummary(BaseModel):
    """Structured verifiable comparison summary between Mode A (Zero Memory) and Mode B (Memory Powered)."""
    retrieved_memories_count: int = Field(..., description="Number of real memories recalled for Mode B")
    mode_a_citations_count: int = Field(0, description="Citations in Mode A (strictly 0)")
    mode_b_citations_count: int = Field(..., description="Verified citations in Mode B mapped to Hindsight IDs")
    avoided_past_mistakes: List[str] = Field(default_factory=list, description="Documented past failures avoided in Mode B")
    brand_rule_compliance: List[str] = Field(default_factory=list, description="Brand restrictions explicitly observed")
    strategic_differences: List[str] = Field(default_factory=list, description="Key concrete divergences between strategies")
    uncertainties: List[str] = Field(default_factory=list, description="Questions left unestablished due to sparse data")
    dimension_checks: List[ComparisonDimensionCheck] = Field(default_factory=list, description="Itemized comparison checks")
    fairness_disclosure: str = Field(..., description="Methodological fairness and nondeterminism disclosure")


class CampaignComparisonRequest(BaseModel):
    """Request payload to execute a controlled Memory Evolution A/B comparison."""
    brand_id: str = Field(..., description="Target brand identifier")
    name: str = Field(..., min_length=2, max_length=255, description="Campaign title or brief name")
    objective: str = Field(..., min_length=2, description="Primary campaign objective")
    platform: str = Field(..., description="Target platform (e.g. Instagram Reels, TikTok)")
    target_audience: Optional[str] = Field(None, description="Specific target segment")
    budget: Optional[float] = Field(None, ge=0, description="Campaign budget")
    offer_or_promotion: Optional[str] = Field(None, description="Incentive or offer mechanic")
    constraints: Optional[str] = Field(None, description="Explicit creative constraints")
    primary_kpi: Optional[str] = Field(None, description="Primary success metric")
    content_language: str = Field("en", description="Campaign language")
    geographic_market: Optional[str] = Field(None, description="Target market")
    preferred_provider: Optional[str] = Field("zai", description="LLM provider (strictly identical for both modes)")


class CampaignComparisonResponse(BaseModel):
    """Complete record of a controlled Memory Evolution comparison."""
    id: str
    brand_id: str
    brand_name: str
    name: str
    campaign_brief: Dict[str, Any]
    provider: str
    model: str
    generation_parameters: Dict[str, Any]
    prompt_version: str = "v1.0"
    baseline_status: str = "COMPLETED"
    memory_status: str = "COMPLETED"
    baseline_strategy: CampaignStrategyOutput
    memory_strategy: CampaignStrategyOutput
    retrieved_memory_references: List[Dict[str, Any]] = Field(default_factory=list)
    reflection_metadata: Optional[Dict[str, Any]] = None
    comparison_summary: ComparisonSummary
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

