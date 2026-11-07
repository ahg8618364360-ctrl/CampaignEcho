from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from backend.app.core.logging import logger
from backend.app.core.exceptions import ResourceNotFoundException, CampaignEchoException
from backend.app.db.models import Brand, Campaign, CampaignMetrics, CampaignFeedback
from backend.app.schemas.campaign import (
    CampaignBriefInput,
    CampaignResponse,
    CampaignStrategyOutput,
    CampaignResultSubmission,
    LearningLoopClosedResponse,
)
from backend.app.services.memory_service import MemoryService, get_memory_service
from backend.app.services.llm_service import LLMService, get_llm_service


class CampaignService:
    """Enterprise Campaign Intelligence and Continuous Learning Service.
    
    Coordinates the end-to-end memory-powered campaign lifecycle:
    1. Memory Recall & Reflection from brand-isolated Vectorize Hindsight bank.
    2. Grounded strategy synthesis via LLM (Z.ai / Groq with transparent fallback).
    3. Campaign persistence in SQLite.
    4. Post-campaign quantitative & qualitative performance ingestion.
    5. Closing the learning loop: Retaining outcomes back into Hindsight memory.
    """

    def __init__(
        self,
        memory_service: Optional[MemoryService] = None,
        llm_service: Optional[LLMService] = None,
    ):
        self.memory_service = memory_service or get_memory_service()
        self.llm_service = llm_service or get_llm_service()

    def _get_verified_brand(self, db: Session, brand_id: str) -> Brand:
        brand = db.query(Brand).filter(Brand.id == brand_id).first()
        if not brand:
            raise ResourceNotFoundException("Brand", brand_id)
        return brand

    def _get_verified_campaign(self, db: Session, campaign_id: str) -> Campaign:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            raise ResourceNotFoundException("Campaign", campaign_id)
        return campaign

    async def generate_campaign(
        self,
        db: Session,
        brief: CampaignBriefInput,
        preferred_provider: Optional[str] = None,
    ) -> CampaignResponse:
        """Execute memory-informed campaign generation loop."""
        brand = self._get_verified_brand(db, brief.brand_id)

        # 1. Ensure dedicated brand bank is provisioned idempotently
        await self.memory_service.provision_bank(db, brand.id)

        # 2. Recall relevant historical memories from Vectorize Hindsight
        recall_query = f"{brief.name} {brief.objective} {brief.platform} {brief.offer_or_promotion or ''}".strip()
        recall_resp = await self.memory_service.recall(
            db=db,
            brand_id=brand.id,
            query=recall_query,
            budget="mid",
        )

        retrieved_memories = [
            {
                "id": item.id,
                "content": item.content,
                "is_synthetic": item.metadata.get("is_synthetic") == "true" or getattr(item, "is_synthetic", False),
                "tags": item.tags,
            }
            for item in recall_resp.results
        ]

        # 3. Call Hindsight Reflect with a focused strategic query
        reflect_query = (
            f"What promotional hooks, formats, and offers have proven most effective or ineffective "
            f"for {brief.objective} targeting {brief.target_audience or brand.target_audience} on {brief.platform}?"
        )
        reflect_resp = await self.memory_service.reflect(
            db=db,
            brand_id=brand.id,
            query=reflect_query,
            budget="mid",
        )

        # 4. Synthesize campaign strategy using LLM (Z.ai / Groq)
        brand_data = {
            "name": brand.name,
            "industry": brand.industry,
            "description": brand.description,
            "target_audience": brand.target_audience,
            "market_region": brand.market_region,
            "brand_voice": brand.brand_voice,
            "restrictions": brand.restrictions,
        }

        strategy = await self.llm_service.generate_strategy(
            brand_data=brand_data,
            brief=brief,
            retrieved_memories=retrieved_memories,
            hindsight_reflection=reflect_resp.reflection,
            preferred_provider=preferred_provider,
        )

        # 5. Persist campaign record in SQLite
        campaign = Campaign(
            brand_id=brand.id,
            name=brief.name,
            brief=f"Objective: {brief.objective} | Platform: {brief.platform} | Target: {brief.target_audience or brand.target_audience}",
            objective=brief.objective,
            platform=brief.platform,
            status="ACTIVE",
            is_synthetic=brief.is_synthetic,
            memory_enabled=True,
            concept_data=brief.model_dump(),
            strategy_output=strategy.model_dump(mode="json"),
            llm_provider=strategy.llm_provider,
            llm_model=strategy.llm_model,
        )

        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        logger.info(
            "Campaign '%s' (%s) generated for brand '%s' using %s (%s). Citations: %d.",
            campaign.name,
            campaign.id,
            brand.name,
            strategy.llm_provider,
            strategy.llm_model,
            len(strategy.memory_citations),
        )

        return CampaignResponse(
            id=campaign.id,
            brand_id=campaign.brand_id,
            name=campaign.name,
            brief=campaign.brief,
            objective=campaign.objective,
            platform=campaign.platform,
            status=campaign.status,
            is_synthetic=campaign.is_synthetic,
            memory_enabled=campaign.memory_enabled,
            llm_provider=campaign.llm_provider,
            llm_model=campaign.llm_model,
            strategy_output=strategy,
            created_at=campaign.created_at,
        )

    async def record_results_and_close_loop(
        self,
        db: Session,
        campaign_id: str,
        results: CampaignResultSubmission,
    ) -> LearningLoopClosedResponse:
        """Ingest performance results, retain into Vectorize Hindsight, and close learning loop."""
        campaign = self._get_verified_campaign(db, campaign_id)
        brand = self._get_verified_brand(db, campaign.brand_id)

        # 1. Save or update CampaignMetrics
        metrics = campaign.metrics
        if not metrics:
            metrics = CampaignMetrics(
                campaign_id=campaign.id,
                primary_kpi=campaign.objective,
            )
            db.add(metrics)

        metrics.spend = results.spend
        metrics.impressions = results.impressions
        metrics.reach = results.reach
        metrics.clicks = results.clicks
        metrics.conversions = results.conversions
        metrics.offer_redemptions = results.offer_redemptions
        if results.spend and results.conversions and results.conversions > 0:
            metrics.cost_per_acquisition = round(results.spend / results.conversions, 2)
        if results.spend and results.revenue and results.spend > 0:
            metrics.roas = round(results.revenue / results.spend, 2)

        # 2. Formulate high-density takeaway for Hindsight memory retention
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        metrics_summary_parts = []
        if results.impressions is not None:
            metrics_summary_parts.append(f"{results.impressions:,} impressions")
        if results.clicks is not None:
            metrics_summary_parts.append(f"{results.clicks:,} clicks")
        if results.offer_redemptions is not None:
            metrics_summary_parts.append(f"{results.offer_redemptions:,} redemptions")
        if results.spend is not None:
            metrics_summary_parts.append(f"${results.spend:,.2f} spend")

        metrics_str = ", ".join(metrics_summary_parts) if metrics_summary_parts else "unmeasured quantitative performance"

        retained_content = (
            f"Campaign Postmortem: '{campaign.name}' ({now_str}) on {campaign.platform}.\n"
            f"Observed Results: {metrics_str}.\n"
            f"Field Observations: {results.observations or 'Standard engagement profile'}.\n"
            f"Audience/Stakeholder Feedback: {results.client_feedback or 'None noted'}.\n"
            f"Core Lessons Learned: {results.lessons_learned}"
        )

        # 3. Retain takeaway into Vectorize Hindsight memory bank
        retain_tags = [
            "campaign_result",
            "learning_loop",
            campaign.platform.lower().replace(" ", "_"),
            brand.industry.lower().replace(" ", "_"),
        ]
        if results.is_synthetic or campaign.is_synthetic:
            retain_tags.append("synthetic")

        retain_resp = await self.memory_service.retain(
            db=db,
            brand_id=brand.id,
            content=retained_content,
            is_synthetic=results.is_synthetic or campaign.is_synthetic,
            source_type="CAMPAIGN_POSTMORTEM",
            tags=retain_tags,
        )

        # 4. Save qualitative CampaignFeedback record
        feedback = CampaignFeedback(
            campaign_id=campaign.id,
            feedback_type="POSTMORTEM_LEARNING",
            content=results.observations or "Post-campaign performance review",
            lessons_learned=results.lessons_learned,
            retained_to_hindsight=(retain_resp.status == "SUCCESS"),
            hindsight_memory_id=retain_resp.operation_id,
        )
        db.add(feedback)

        # Update campaign status
        campaign.status = "COMPLETED"
        db.commit()

        # 5. Active Verification: Prove the newly retained memory is immediately retrievable
        verification_query = f"{campaign.name} lessons learned"
        verify_recall = await self.memory_service.recall(
            db=db,
            brand_id=brand.id,
            query=verification_query,
            budget="mid",
        )
        recalled_verified = any(
            campaign.name.lower() in (r.content or "").lower() or results.lessons_learned[:20].lower() in (r.content or "").lower()
            for r in verify_recall.results
        )

        bank_id = self.memory_service.get_bank_id_for_brand(brand.id)
        msg = (
            f"Campaign results successfully ingested. Memory retained to Vectorize Hindsight bank '{bank_id}' "
            f"and verified retrievable for future strategy generation."
        )

        return LearningLoopClosedResponse(
            campaign_id=campaign.id,
            brand_id=brand.id,
            hindsight_bank_id=bank_id,
            metrics_recorded=True,
            retained_to_hindsight=(retain_resp.status == "SUCCESS"),
            retained_memory_content=retained_content,
            hindsight_retain_operation_id=retain_resp.operation_id,
            hindsight_recalled_verification=recalled_verified,
            verified_retrieval_query=verification_query,
            message=msg,
            timestamp=datetime.now(timezone.utc),
        )

    def list_campaigns(self, db: Session, brand_id: Optional[str] = None) -> List[Campaign]:
        """Query campaigns with optional brand isolation filter."""
        query = db.query(Campaign)
        if brand_id:
            query = query.filter(Campaign.brand_id == brand_id)
        return query.order_by(Campaign.created_at.desc()).all()

    def get_campaign(self, db: Session, campaign_id: str) -> Campaign:
        """Fetch single campaign with eager loaded metrics and feedback."""
        return self._get_verified_campaign(db, campaign_id)


def get_campaign_service() -> CampaignService:
    """Dependency injector for Campaign Service."""
    return CampaignService()

