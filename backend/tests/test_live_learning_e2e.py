"""CampaignEcho — Dedicated Live End-to-End Continuous Learning Verification Test.

Exercises the complete live learning loop against:
1. Real Vectorize Hindsight Cloud (https://api.hindsight.vectorize.io).
2. Real Z.ai LLM (GLM-4.5-Flash).
3. SQLite persistent storage for campaigns, metrics, and postmortems.
4. Fresh-session retrieval verifying persistent cognitive memory across separate sessions.

Strictly marked with @pytest.mark.integration and @pytest.mark.asyncio.
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.models import Brand, Campaign, CampaignMetrics, CampaignFeedback
from backend.app.schemas.campaign import CampaignBriefInput, CampaignResultSubmission
from backend.app.services.memory_service import MemoryService
from backend.app.services.llm_service import LLMService
from backend.app.services.campaign_service import CampaignService


@pytest.mark.integration
@pytest.mark.asyncio
async def test_live_continuous_learning_loop_e2e(db_session: Session):
    """Exercises the complete live CampaignEcho cognitive learning loop."""
    hindsight_key = settings.HINDSIGHT_API_KEY
    zai_key = settings.ZAI_API_KEY

    if not hindsight_key or hindsight_key.startswith("your_"):
        pytest.skip("Live Hindsight Cloud API key not configured; skipping E2E test.")
    if not zai_key or zai_key.startswith("your_"):
        pytest.skip("Live Z.ai API key not configured; skipping E2E test.")

    # -------------------------------------------------------------------------
    # STEP 1: Load or Seed Brand Profile (The Taco Syndicate)
    # -------------------------------------------------------------------------
    brand = db_session.query(Brand).filter(
        Brand.name == "The Taco Syndicate"
    ).first()

    if not brand:
        brand = Brand(
            id=str(uuid.uuid4()),
            name="The Taco Syndicate",
            description="Late-night urban street tacos with fiery salsa and loaded queso.",
            industry="Food & Beverage",
            target_audience="College Undergrads, Night Owls & Late Shift Workers",
            brand_voice="Irreverent, Energetic, Punchy",
            market_region="Austin, TX",
            preferred_language="en",
            is_synthetic=True,
        )
        db_session.add(brand)
        db_session.commit()
        db_session.refresh(brand)

    brand_id = brand.id
    expected_bank_id = f"campaignecho-brand-{brand_id.lower()}"
    logger.info("E2E Step 1: Brand profile loaded: %s (%s)", brand.name, brand_id)

    # -------------------------------------------------------------------------
    # STEP 2 & 3: Real Hindsight Recall and Reflect
    # -------------------------------------------------------------------------
    memory_service = MemoryService(
        api_url=settings.effective_hindsight_url,
        api_key=hindsight_key,
    )

    # Idempotently ensure bank exists
    provision_res = await memory_service.provision_bank(db_session, brand_id)
    assert provision_res.bank_provisioned is True

    # Check if baseline historical memory exists in Hindsight Cloud bank
    baseline_check = await memory_service.recall(
        db=db_session,
        brand_id=brand_id,
        query="tacos queso late-night promotion",
        budget="low",
    )
    if not baseline_check.results or len(baseline_check.results) == 0:
        logger.info("Seeding verified baseline historical postmortems into Hindsight Cloud bank...")
        seed_content = (
            "Campaign Postmortem: 'Late-Night Queso Blast' on Instagram Reels. "
            "Observed Results: 48,200 impressions, 389 redemptions, $1,150 spend. "
            "Core Lessons Learned: ASMR food prep clips of cheese pull converted 3.2x higher than talking heads; "
            "midnight flash codes drive peak redemptions between 11 PM and 1 AM."
        )
        seed_retain = await memory_service.retain(
            db=db_session,
            brand_id=brand_id,
            content=seed_content,
            is_synthetic=True,
            source_type="CAMPAIGN_POSTMORTEM",
            tags=["baseline", "queso", "reels", "historical"],
        )
        assert seed_retain.status == "SUCCESS"
        assert seed_retain.operation_id is not None
        await asyncio.sleep(2)  # Allow Hindsight Cloud indexing window

    # Step 2: Recall
    recall_res = await memory_service.recall(
        db=db_session,
        brand_id=brand_id,
        query="Late-night tacos queso reels promotion redemptions",
        budget="mid",
    )
    assert recall_res.results is not None
    assert len(recall_res.results) > 0, "Hindsight Recall must return real historical memories"
    recalled_ids = [str(r.id) for r in recall_res.results if r.id]
    logger.info("E2E Step 2: Recalled %d real Hindsight memory records: %s", len(recalled_ids), recalled_ids)

    # Step 3: Reflect
    reflect_res = await memory_service.reflect(
        db=db_session,
        brand_id=brand_id,
        query="What promotional formats and timings maximize redemptions for late-night college students?",
        budget="mid",
    )
    assert reflect_res.reflection is not None
    assert len(reflect_res.reflection) > 20
    logger.info("E2E Step 3: Hindsight reflection received (%d chars): %s...", len(reflect_res.reflection), reflect_res.reflection[:120])

    # -------------------------------------------------------------------------
    # STEP 4: Real Z.ai Campaign Generation
    # -------------------------------------------------------------------------
    llm_service = LLMService(
        zai_api_key=zai_key,
        groq_api_key=None, # Groq explicitly disabled
        timeout=180.0,
    )
    campaign_service = CampaignService(
        memory_service=memory_service,
        llm_service=llm_service,
    )

    brief_input = CampaignBriefInput(
        brand_id=brand_id,
        name="Midnight Stash Run Vol. 2",
        objective="Drive Flash Walk-in Traffic",
        platform="Instagram Reels",
        content_language="en",
        target_audience="Austin College Night Owls",
        budget=1500.00,
        primary_kpi="Promo Redemptions",
        offer_or_promotion="Free Loaded Queso with 2-Taco Box after 10 PM",
        constraints="High energy, ASMR food focus, no corporate speak",
        duration_days=7,
        is_synthetic=True,
    )

    campaign_resp = await campaign_service.generate_campaign(
        db=db_session,
        brief=brief_input,
        preferred_provider="zai",
    )

    # -------------------------------------------------------------------------
    # STEP 5 & 6: Verify Structured Output and Real Citations
    # -------------------------------------------------------------------------
    strategy = campaign_resp.strategy_output
    assert strategy is not None
    assert strategy.llm_provider == "zai"
    assert strategy.llm_model == "glm-4.5-flash"
    assert strategy.fallback_used is False
    assert len(strategy.reel_concepts) >= 1
    assert strategy.epistemic_triad is not None
    assert len(strategy.epistemic_triad.observed_facts) >= 1
    assert len(strategy.epistemic_triad.strategic_inferences) >= 1
    assert len(strategy.epistemic_triad.actionable_recommendations) >= 1

    # Verify every citation corresponds to an actual Hindsight memory ID
    logger.info("E2E Step 5: Validating citations against real recalled Hindsight IDs...")
    assert len(strategy.memory_citations) > 0, "Strategy must contain grounded memory citations"
    all_bank_memories = await memory_service.recall(
        db=db_session, brand_id=brand_id, query="campaign marketing tacos late night", budget="high"
    )
    all_bank_ids = {str(r.id) for r in all_bank_memories.results if r.id} | set(recalled_ids)
    for cit in strategy.memory_citations:
        assert cit.memory_id is not None
        assert cit.memory_id in all_bank_ids, (
            f"Citation ID '{cit.memory_id}' must match an actual recalled Hindsight record ID from {all_bank_ids}!"
        )
        assert cit.provenance == "Vectorize Hindsight Cloud"
        logger.info("Verified citation: [%s] Observation: %s", cit.memory_id, cit.observation[:80])

    # -------------------------------------------------------------------------
    # STEP 7: Verify Persistence in SQLite
    # -------------------------------------------------------------------------
    saved_campaign = db_session.query(Campaign).filter(Campaign.id == campaign_resp.id).first()
    assert saved_campaign is not None
    assert saved_campaign.llm_provider == "zai"
    assert saved_campaign.llm_model == "glm-4.5-flash"
    assert saved_campaign.status == "ACTIVE"
    logger.info("E2E Step 7: Campaign persisted in SQLite with ID: %s", saved_campaign.id)

    # -------------------------------------------------------------------------
    # STEP 8 & 9: Ingest Results & Retain via Hindsight Cloud (Close Loop)
    # -------------------------------------------------------------------------
    timestamp_marker = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    unique_learning_lesson = (
        f"Verified E2E Loop Run [{timestamp_marker}]: Fast-paced 6-second countdown timers "
        f"paired with sizzling queso ASMR generated 412 redemptions and $1,150 spend."
    )

    result_submission = CampaignResultSubmission(
        impressions=54200,
        reach=38100,
        clicks=2190,
        conversions=435,
        offer_redemptions=412,
        spend=1150.00,
        revenue=4850.00,
        observations="Video drop at 11:15 PM converted 4.1x faster than afternoon posts.",
        client_feedback="Kitchen hit capacity within 45 minutes of post launch.",
        lessons_learned=unique_learning_lesson,
        is_synthetic=True,
    )

    loop_res = await campaign_service.record_results_and_close_loop(
        db=db_session,
        campaign_id=saved_campaign.id,
        results=result_submission,
    )

    assert loop_res.retained_to_hindsight is True
    assert loop_res.hindsight_retain_operation_id is not None
    assert loop_res.hindsight_recalled_verification is True
    assert saved_campaign.status == "COMPLETED"
    logger.info("E2E Step 9: Postmortem retained to Hindsight Cloud. Op ID: %s", loop_res.hindsight_retain_operation_id)

    # -------------------------------------------------------------------------
    # STEP 10, 11 & 12: Fresh Session Verification (Cross-Session Cognitive Recall)
    # -------------------------------------------------------------------------
    logger.info("E2E Step 10: Initializing fresh isolated session client to verify cross-session persistence...")
    fresh_memory_service = MemoryService(
        api_url=settings.effective_hindsight_url,
        api_key=hindsight_key,
    )

    fresh_recall = await fresh_memory_service.recall(
        db=db_session,
        brand_id=brand_id,
        query="Midnight Stash Run Vol. 2 queso countdown timers redemptions",
        budget="high",
    )

    assert fresh_recall.results is not None
    assert len(fresh_recall.results) > 0, "Fresh session must retrieve memories from Hindsight Cloud"

    fresh_recalled_contents = [r.content for r in fresh_recall.results if r.content]
    found_retained_experience = any(
        "Midnight Stash Run Vol. 2" in content
        or "54,200" in content
        or "412 redemptions" in content
        or "11:15 PM" in content
        for content in fresh_recalled_contents
    )
    assert found_retained_experience, (
        f"Fresh session failed to recall newly retained campaign facts. "
        f"Recalled contents from Hindsight Cloud: {fresh_recalled_contents}"
    )

    matched_content = [c for c in fresh_recalled_contents if "Midnight Stash Run" in c or "54,200" in c or "412" in c][0]
    logger.info(
        "E2E Step 12: SUCCESS! Fresh session successfully recalled the newly retained learning from Hindsight Cloud: %s",
        matched_content,
    )
