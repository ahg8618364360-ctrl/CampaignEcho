import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.db.models import Brand, CampaignComparison, User
from backend.app.core.security import create_user_session, hash_password
from backend.app.services.campaign_service import CampaignService, get_campaign_service
from backend.app.services.memory_service import MemoryService
from backend.app.services.llm_service import LLMService
from backend.app.schemas.campaign import (
    CampaignBriefInput,
    CampaignStrategyOutput,
    EpistemicTriad,
    MemoryCitation,
    ReelConcept,
    CampaignComparisonRequest,
)


@pytest.fixture
def mock_baseline_strategy():
    """Mode A: Generic strategy generated without memory context."""
    return CampaignStrategyOutput(
        campaign_concept="Late Night Tacos for Students",
        main_objective="Increase late-night restaurant foot traffic",
        target_audience="College students",
        campaign_positioning="Affordable late night food",
        creative_direction="Lively student vibe with energetic music",
        reel_concepts=[
            ReelConcept(
                concept_title="Generic Late Night Craving",
                hook="Hungry after studying? Grab a bite.",
                visual_direction="Fast cuts of food preparation",
                script_or_caption="Check out our late night menu open until midnight.",
                call_to_action="Visit us tonight",
                supporting_memory_id=None,
                supporting_memory_quote=None,
            )
        ],
        content_formats=["9:16 Video"],
        caption_directions=["Standard promo caption"],
        suggested_hooks=["Study late, eat great"],
        platform_specific_execution="Instagram Reels native audio",
        offer_recommendations="10% student discount with student ID",
        call_to_action="Stop by before closing",
        kpi_recommendations=["Impressions", "Foot traffic"],
        execution_timeline=["Day 1-7: Awareness push"],
        potential_risks=["Low awareness in initial days"],
        historical_rationale="Generated as a stateless baseline without prior campaign memory context.",
        memory_citations=[],
        epistemic_triad=EpistemicTriad(
            observed_facts=[],
            strategic_inferences=["Students seek affordable food after evening classes."],
            actionable_recommendations=["Promote standard 10% discount across campus social channels."],
            unresolved_uncertainties=["Actual student traffic timing variance unmeasured."],
        ),
        llm_provider="zai",
        llm_model="glm-4.5-flash",
        fallback_used=False,
    )


@pytest.fixture
def mock_memory_strategy():
    """Mode B: Grounded strategy informed by Vectorize Hindsight memory."""
    return CampaignStrategyOutput(
        campaign_concept="Midnight Burrito Drop & Free Queso Unlock",
        main_objective="Increase late-night student foot traffic post 10 PM",
        target_audience="Austin University Students & Night-Owls",
        campaign_positioning="High-energy street tacos with tangible food freebie incentive",
        creative_direction="Warm moody lighting, sizzling griddle macro close-ups, urgency clock",
        reel_concepts=[
            ReelConcept(
                concept_title="Midnight Sizzle & Free Queso Drop",
                hook="Study session dragging past 10 PM? Put the laptop down.",
                visual_direction="Macro close-up of melted queso cascading over crisp carnitas",
                script_or_caption="Flash your student ID after 10 PM. Buy 2 tacos, get loaded queso free.",
                call_to_action="Show student ID at cashier before 2 AM",
                supporting_memory_id="mem-grounded-01",
                supporting_memory_quote="Flash student BOGO after 9 PM drove 380 redemptions with $18.40 AOV.",
            )
        ],
        content_formats=["Instagram Reel 9:16", "Instagram Story Interactive Countdown"],
        caption_directions=["Hook-Value-CTA framework emphasizing zero-cost queso bonus"],
        suggested_hooks=["The 10 PM Austin secret", "Midnight study break fuel"],
        platform_specific_execution="Instagram Reels trending audio with scarcity countdown sticker",
        offer_recommendations="Buy 2 tacos, get free loaded queso after 10 PM (avoids ineffective percentage discounts)",
        call_to_action="Flash student ID at the register tonight",
        kpi_recommendations=["Offer Redemptions after 10 PM", "Late Night AOV"],
        execution_timeline=["Phase 1 (10 PM): Launch urgency alert", "Phase 2 (10 PM - 2 AM): Counter redemption rush"],
        potential_risks=["Kitchen congestion during midnight peak rush"],
        historical_rationale="Grounded in prior BOGO redemption success; explicitly avoids failed gourmet positioning.",
        memory_citations=[
            MemoryCitation(
                memory_id="mem-grounded-01",
                observation="Flash student BOGO after 9 PM drove 380 redemptions with $18.40 AOV.",
                category="OBSERVED_FACT",
                provenance="Vectorize Hindsight Cloud",
                is_synthetic=False,
            )
        ],
        epistemic_triad=EpistemicTriad(
            observed_facts=["Previous flash student BOGO drove 380 redemptions; truffle tasting gourmet pitch failed with 14 redemptions."],
            strategic_inferences=["Students respond decisively to tangible high-perceived-value food freebies rather than modest percentage discounts."],
            actionable_recommendations=["Deploy cheese-pull vertical video emphasizing immediate in-store queso redemption after 10 PM."],
            unresolved_uncertainties=["Weekend late-night foot traffic versus weekday study night conversion difference unmeasured."],
        ),
        llm_provider="zai",
        llm_model="glm-4.5-flash",
        fallback_used=False,
    )


@pytest.fixture
def auth_headers(db_session, test_brand):
    """Create authenticated user owning test_brand (authentic writable workspace)."""
    user = User(
        email="comparison_tester@campaignecho.io",
        hashed_password=hash_password("ValidPassword123!"),
        full_name="Comparison Tester",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    test_brand.user_id = user.id
    test_brand.is_synthetic = False
    db_session.commit()

    _, raw_token = create_user_session(db_session, user_id=user.id)
    return {"Authorization": f"Bearer {raw_token}"}


def test_comparison_endpoint_flow(db_session, test_brand, auth_headers, mock_baseline_strategy, mock_memory_strategy):
    """Test full POST /api/v1/campaigns/compare controlled A/B execution."""
    mock_mem = MagicMock(spec=MemoryService)
    mock_mem.get_bank_id_for_brand.return_value = f"campaignecho-brand-{test_brand.id}"
    mock_mem.provision_bank = AsyncMock()
    
    # Mock Hindsight Recall returning 1 real memory item
    mock_mem_item = MagicMock()
    mock_mem_item.id = "mem-grounded-01"
    mock_mem_item.content = "Flash student BOGO after 9 PM drove 380 redemptions with $18.40 AOV."
    mock_mem_item.metadata = {"is_synthetic": "false"}
    mock_mem_item.tags = ["late-night", "bogo", "student"]
    mock_mem.recall = AsyncMock(return_value=MagicMock(results=[mock_mem_item]))
    mock_mem.reflect = AsyncMock(return_value=MagicMock(reflection="Students prioritize immediate food value over discount percentages."))

    # Mock LLM generating baseline on 1st call, memory strategy on 2nd call
    mock_llm = MagicMock(spec=LLMService)
    mock_llm.generate_strategy = AsyncMock(side_effect=[mock_baseline_strategy, mock_memory_strategy])

    test_service = CampaignService(memory_service=mock_mem, llm_service=mock_llm)
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_campaign_service] = lambda: test_service

    client = TestClient(app)

    payload = {
        "brand_id": test_brand.id,
        "name": "Late-Night Student Craving Campaign",
        "objective": "Foot Traffic",
        "platform": "Instagram Reels",
        "target_audience": "University Students",
        "offer_or_promotion": "Buy 2 tacos get free loaded queso after 10 PM",
        "preferred_provider": "zai"
    }

    response = client.post("/api/v1/campaigns/compare", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()

    # 1. Verification of identity & provenance
    assert data["brand_id"] == test_brand.id
    assert data["brand_name"] == test_brand.name
    assert data["provider"] == "zai"
    assert data["model"] == "glm-4.5-flash"
    assert "temperature" in data["generation_parameters"]

    # 2. Mode A has ZERO citations
    assert len(data["baseline_strategy"]["memory_citations"]) == 0
    assert data["comparison_summary"]["mode_a_citations_count"] == 0

    # 3. Mode B has verified citations
    assert len(data["memory_strategy"]["memory_citations"]) == 1
    assert data["memory_strategy"]["memory_citations"][0]["memory_id"] == "mem-grounded-01"
    assert data["comparison_summary"]["mode_b_citations_count"] == 1

    # 4. Verifiable Comparison Summary Checks
    summary = data["comparison_summary"]
    assert summary["retrieved_memories_count"] == 1
    assert len(summary["dimension_checks"]) == 6
    assert len(summary["avoided_past_mistakes"]) >= 1
    assert "fairness_disclosure" in summary

    # 5. Zero fake percentage scores verification
    raw_text = str(summary)
    assert "95% better" not in raw_text
    assert "3x smarter" not in raw_text
    assert "accuracy score" not in raw_text.lower()

    # 6. Verify Hindsight retain was NEVER called (preventing contamination)
    mock_mem.retain.assert_not_called()

    # 7. Verify comparison persistence in database
    comp_id = data["id"]
    get_resp = client.get(f"/api/v1/campaigns/compare/{comp_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == comp_id

    # 8. Verify list comparisons
    list_resp = client.get(f"/api/v1/campaigns/compare?brand_id={test_brand.id}", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
    assert list_resp.json()[0]["id"] == comp_id

    app.dependency_overrides.clear()


def test_comparison_rejects_hallucinated_citations(db_session, test_brand, auth_headers, mock_baseline_strategy, mock_memory_strategy):
    """Test that Mode B strips citations that do not exist in the retrieved memory bank."""
    mock_mem = MagicMock(spec=MemoryService)
    mock_mem.get_bank_id_for_brand.return_value = f"campaignecho-brand-{test_brand.id}"
    mock_mem.provision_bank = AsyncMock()
    # Return empty memories
    mock_mem.recall = AsyncMock(return_value=MagicMock(results=[]))
    mock_mem.reflect = AsyncMock(return_value=MagicMock(reflection="No prior patterns"))

    # LLM attempts to fabricate a citation
    fake_citation_strategy = mock_memory_strategy.model_copy(deep=True)
    fake_citation_strategy.memory_citations = [
        MemoryCitation(
            memory_id="mem-hallucinated-999",
            observation="Invented fake fact",
            category="OBSERVED_FACT",
            provenance="Invented",
            is_synthetic=False,
        )
    ]

    mock_llm = MagicMock(spec=LLMService)
    mock_llm.generate_strategy = AsyncMock(side_effect=[mock_baseline_strategy, fake_citation_strategy])

    test_service = CampaignService(memory_service=mock_mem, llm_service=mock_llm)
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_campaign_service] = lambda: test_service

    client = TestClient(app)
    payload = {
        "brand_id": test_brand.id,
        "name": "Testing Citation Filtering",
        "objective": "Foot Traffic",
        "platform": "Instagram Reels",
    }
    response = client.post("/api/v1/campaigns/compare", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()

    # Hallucinated citation must be purged because it was not in retrieved memories
    assert len(data["memory_strategy"]["memory_citations"]) == 0
    assert data["comparison_summary"]["mode_b_citations_count"] == 0

    app.dependency_overrides.clear()


def test_comparison_brand_not_found(db_session, auth_headers):
    """Test 404 response when brand ID does not exist."""
    app.dependency_overrides[get_db] = lambda: db_session
    client = TestClient(app)
    payload = {
        "brand_id": "nonexistent-brand-id-999",
        "name": "Missing Brand Comparison",
        "objective": "Awareness",
        "platform": "TikTok",
    }
    response = client.post("/api/v1/campaigns/compare", json=payload, headers=auth_headers)
    assert response.status_code == 404
    app.dependency_overrides.clear()


def test_comparison_mode_a_never_calls_hindsight(db_session, test_brand, auth_headers, mock_baseline_strategy, mock_memory_strategy):
    """Verify Mode A strictly runs before any Hindsight memory retrieval and does not receive memory context."""
    mock_mem = MagicMock(spec=MemoryService)
    mock_mem.get_bank_id_for_brand.return_value = f"campaignecho-brand-{test_brand.id}"
    mock_mem.provision_bank = AsyncMock()
    mock_mem.recall = AsyncMock(return_value=MagicMock(results=[]))
    mock_mem.reflect = AsyncMock(return_value=MagicMock(reflection="No reflection"))

    call_records = []

    async def mock_generate(brand_data, brief, retrieved_memories, hindsight_reflection, preferred_provider=None):
        if not retrieved_memories and hindsight_reflection is None:
            call_records.append("mode_a")
            return mock_baseline_strategy
        else:
            call_records.append("mode_b")
            return mock_memory_strategy

    mock_llm = MagicMock(spec=LLMService)
    mock_llm.generate_strategy = AsyncMock(side_effect=mock_generate)

    test_service = CampaignService(memory_service=mock_mem, llm_service=mock_llm)
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_campaign_service] = lambda: test_service

    client = TestClient(app)
    payload = {
        "brand_id": test_brand.id,
        "name": "Sequence Verification",
        "objective": "Foot Traffic",
        "platform": "Instagram Reels",
    }
    resp = client.post("/api/v1/campaigns/compare", json=payload, headers=auth_headers)
    assert resp.status_code == 201

    # Mode A must execute first with zero memory
    assert call_records[0] == "mode_a"
    assert call_records[1] == "mode_b"
    assert len(call_records) == 2

    # Verify recall & reflect called exactly once (for Mode B only)
    assert mock_mem.recall.call_count == 1
    assert mock_mem.reflect.call_count == 1

    app.dependency_overrides.clear()

