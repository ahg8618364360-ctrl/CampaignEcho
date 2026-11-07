import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.db.models import Brand, Campaign
from backend.app.services.campaign_service import CampaignService, get_campaign_service
from backend.app.services.memory_service import MemoryService
from backend.app.services.llm_service import LLMService
from backend.app.schemas.campaign import (
    CampaignBriefInput,
    CampaignStrategyOutput,
    EpistemicTriad,
    MemoryCitation,
    ReelConcept,
    CampaignResultSubmission,
)


@pytest.fixture
def mock_llm_strategy():
    return CampaignStrategyOutput(
        campaign_concept="Mock Midnight Burrito Drop",
        main_objective="Foot Traffic",
        target_audience="Austin Students",
        campaign_positioning="Fast value tacos",
        creative_direction="High energy, late-night sizzle",
        reel_concepts=[
            ReelConcept(
                concept_title="Queso Pour Drop",
                hook="Late night study break? Stop scrolling.",
                visual_direction="Close-up melted queso cascading over crispy carnitas",
                script_or_caption="Show your student ID after 10 PM and grab free chips & queso.",
                call_to_action="Flash ID at cashier tonight",
                supporting_memory_id="mem-mock-1",
                supporting_memory_quote="Macro food prep clips drove 4.2x engagement over static carousels.",
            )
        ],
        content_formats=["9:16 Video"],
        caption_directions=["Direct benefit hook, time constraint, instant in-store reward"],
        suggested_hooks=["Your midnight study fix is waiting", "The 10 PM Austin secret"],
        platform_specific_execution="Instagram Reels native pacing with trending audio",
        offer_recommendations="Free queso with any 2 tacos after 10 PM",
        call_to_action="Head to the counter before 2 AM",
        kpi_recommendations=["Flash Redemptions", "Average Order Value"],
        execution_timeline=["Phase 1: 10 PM alert", "Phase 2: Live counter rush"],
        potential_risks=["Kitchen rush delay if demand spikes"],
        historical_rationale="Grounding in prior BOGO success and avoiding upscale gourmet positioning.",
        memory_citations=[
            MemoryCitation(
                memory_id="mem-mock-1",
                observation="Flash student BOGO after 9 PM drove 380 redemptions.",
                category="OBSERVED_FACT",
                provenance="Vectorize Hindsight Cloud",
                is_synthetic=True,
            )
        ],
        epistemic_triad=EpistemicTriad(
            observed_facts=["Student BOGO drove 380 redemptions in previous late-night tests."],
            strategic_inferences=["Late-night students respond more urgently to tangible food freebies than percentage discounts."],
            actionable_recommendations=["Deploy fast-paced vertical video focusing on cheese pull visual hook."],
            unresolved_uncertainties=["Sunday night vs Thursday night conversion variance unmeasured."],
        ),
        llm_provider="zai",
        llm_model="glm-4.5-flash",
        fallback_used=False,
    )


def test_campaign_generation_endpoint(db_session, test_brand, mock_llm_strategy):
    """Test POST /api/v1/campaigns/generate with mocked memory and LLM service."""
    mock_mem = MagicMock(spec=MemoryService)
    mock_mem.get_bank_id_for_brand.return_value = f"campaignecho-brand-{test_brand.id}"
    mock_mem.provision_bank = AsyncMock()
    mock_mem.recall = AsyncMock(return_value=MagicMock(results=[]))
    mock_mem.reflect = AsyncMock(return_value=MagicMock(reflection="Mock reflection insight"))

    mock_llm = MagicMock(spec=LLMService)
    mock_llm.generate_strategy = AsyncMock(return_value=mock_llm_strategy)

    service = CampaignService(memory_service=mock_mem, llm_service=mock_llm)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_campaign_service] = lambda: service

    with TestClient(app) as client:
        payload = {
            "brand_id": test_brand.id,
            "name": "Midnight Queso Splash",
            "objective": "Foot Traffic",
            "platform": "Instagram Reels",
            "target_audience": "UT Austin Students",
            "offer_or_promotion": "Free Queso with Burrito",
            "budget": 800.0,
            "primary_kpi": "Store Redemptions",
            "is_synthetic": True,
        }

        resp = client.post("/api/v1/campaigns/generate", json=payload)
        assert resp.status_code == 201
        data = resp.json()

        assert data["name"] == "Midnight Queso Splash"
        assert data["brand_id"] == test_brand.id
        assert data["status"] == "ACTIVE"
        assert data["strategy_output"]["campaign_concept"] == "Mock Midnight Burrito Drop"
        assert len(data["strategy_output"]["reel_concepts"]) == 1
        assert data["strategy_output"]["reel_concepts"][0]["supporting_memory_id"] == "mem-mock-1"

    app.dependency_overrides.clear()


def test_campaign_results_submission_closes_loop(db_session, test_brand):
    """Test POST /api/v1/campaigns/{id}/results records metrics and retains to Hindsight."""
    campaign = Campaign(
        brand_id=test_brand.id,
        name="Flash Burrito Test Campaign",
        brief="Testing midnight foot traffic",
        objective="Foot Traffic",
        platform="Instagram Reels",
        status="ACTIVE",
        is_synthetic=True,
    )
    db_session.add(campaign)
    db_session.commit()
    db_session.refresh(campaign)

    mock_mem = MagicMock(spec=MemoryService)
    mock_mem.get_bank_id_for_brand.return_value = f"campaignecho-brand-{test_brand.id}"
    mock_mem.retain = AsyncMock(
        return_value=MagicMock(status="SUCCESS", operation_id="op-test-retain-123")
    )
    mock_mem.recall = AsyncMock(
        return_value=MagicMock(
            results=[
                MagicMock(content=f"Campaign Postmortem: '{campaign.name}' on Instagram Reels.")
            ]
        )
    )

    service = CampaignService(memory_service=mock_mem)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_campaign_service] = lambda: service

    with TestClient(app) as client:
        results_payload = {
            "reporting_period": "Oct 2026",
            "impressions": 25000,
            "reach": 18000,
            "clicks": 950,
            "conversions": 210,
            "offer_redemptions": 195,
            "spend": 600.0,
            "revenue": 2400.0,
            "observations": "High volume between 11 PM and 1 AM",
            "client_feedback": "Fastest coupon redemptions in store history",
            "lessons_learned": "Late-night student demand is highly elastic to immediate free item incentives.",
            "is_synthetic": True,
        }

        resp = client.post(f"/api/v1/campaigns/{campaign.id}/results", json=results_payload)
        assert resp.status_code == 200
        data = resp.json()

        assert data["campaign_id"] == campaign.id
        assert data["metrics_recorded"] is True
        assert data["retained_to_hindsight"] is True
        assert data["hindsight_retain_operation_id"] == "op-test-retain-123"
        assert data["hindsight_recalled_verification"] is True

        # Verify DB campaign status updated to COMPLETED
        db_session.refresh(campaign)
        assert campaign.status == "COMPLETED"
        assert campaign.metrics is not None
        assert campaign.metrics.conversions == 210
        assert campaign.metrics.spend == 600.0

    app.dependency_overrides.clear()

