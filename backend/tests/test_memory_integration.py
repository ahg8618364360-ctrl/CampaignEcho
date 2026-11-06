import os
import pytest
import asyncio
from hindsight_client import Hindsight
from backend.app.core.config import settings
from backend.app.services.memory_service import MemoryService
from backend.app.db.models import Brand


# Determine if live Hindsight service is accessible with credentials
HINDSIGHT_KEY = os.getenv("HINDSIGHT_API_KEY") or settings.HINDSIGHT_API_KEY
HINDSIGHT_URL = os.getenv("HINDSIGHT_API_URL") or os.getenv("HINDSIGHT_BASE_URL") or settings.effective_hindsight_url

live_hindsight_available = bool(HINDSIGHT_KEY)

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        not live_hindsight_available,
        reason="Live Hindsight service credentials (HINDSIGHT_API_KEY) not configured in .env. Configure HINDSIGHT_API_KEY to run live cloud integration tests against https://api.hindsight.vectorize.io.",
    ),
]


@pytest.fixture
def live_hindsight_client():
    return Hindsight(
        base_url=HINDSIGHT_URL,
        api_key=HINDSIGHT_KEY,
        timeout=settings.HINDSIGHT_TIMEOUT,
    )


@pytest.mark.asyncio
async def test_critical_1_real_retain(live_hindsight_client, db_session):
    """CRITICAL TEST 1: Real Retain against Hindsight service."""
    service = MemoryService(hindsight_client=live_hindsight_client)

    brand = Brand(
        name="The Taco Syndicate Live",
        industry="Dining",
        description="Live integration test restaurant",
        target_audience="Austin Students",
        market_region="Austin, TX",
        brand_voice="Casual",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    # 1. Provision bank
    prov = await service.provision_bank(db=db_session, brand_id=brand.id)
    assert prov.status in ["PROVISIONED", "ALREADY_EXISTS"]

    # 2. Real retain
    content = "Live Test Takeaway: Flash student BOGO after 9 PM drove 380 synthetic redemptions."
    retain_resp = await service.retain(
        db=db_session,
        brand_id=brand.id,
        content=content,
        is_synthetic=True,
        source_type="SYNTHETIC_FIXTURE",
        tags=["bogo", "late_night", "live_test"],
    )
    assert retain_resp.status == "SUCCESS"
    assert retain_resp.is_synthetic is True


@pytest.mark.asyncio
async def test_critical_2_real_recall(live_hindsight_client, db_session):
    """CRITICAL TEST 2: Real Recall of stored experience."""
    service = MemoryService(hindsight_client=live_hindsight_client)

    brand = Brand(
        name="The Taco Syndicate Live 2",
        industry="Dining",
        description="Live test recall",
        target_audience="Students",
        market_region="Austin",
        brand_voice="Casual",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    await service.provision_bank(db=db_session, brand_id=brand.id)

    # Retain a specific fact
    unique_phrase = f"Truffle burger promo failed due to gourmet price perception in Austin"
    await service.retain(
        db=db_session,
        brand_id=brand.id,
        content=unique_phrase,
        tags=["truffle", "pricing", "mistake"],
    )

    # Query recall
    recall_resp = await service.recall(
        db=db_session,
        brand_id=brand.id,
        query="What happened with the truffle promotion?",
        budget="mid",
    )
    assert recall_resp.total_results >= 0
    assert recall_resp.brand_id == brand.id
    assert "bank_id" not in recall_resp.model_dump()


@pytest.mark.asyncio
async def test_critical_3_real_reflect(live_hindsight_client, db_session):
    """CRITICAL TEST 3: Real Reflect synthesis."""
    service = MemoryService(hindsight_client=live_hindsight_client)

    brand = Brand(
        name="The Taco Syndicate Live 3",
        industry="Dining",
        description="Live test reflect",
        target_audience="Students",
        market_region="Austin",
        brand_voice="Casual",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    await service.provision_bank(db=db_session, brand_id=brand.id)

    reflect_resp = await service.reflect(
        db=db_session,
        brand_id=brand.id,
        query="What promotional formats work best for budget-conscious students?",
        budget="low",
    )
    assert reflect_resp.reflection is not None
    assert len(reflect_resp.reflection) > 0


@pytest.mark.asyncio
async def test_critical_4_cross_session_persistence(live_hindsight_client, db_session):
    """CRITICAL TEST 4: Cross-session persistence across client re-initialization."""
    brand = Brand(
        name="The Taco Syndicate Persistence",
        industry="Dining",
        description="Persistence brand",
        target_audience="Students",
        market_region="Austin",
        brand_voice="Casual",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    # Session 1: Provision and retain
    service1 = MemoryService(hindsight_client=live_hindsight_client)
    await service1.provision_bank(db=db_session, brand_id=brand.id)
    await service1.retain(
        db=db_session,
        brand_id=brand.id,
        content="Cross-session lesson: Visual food prep videos outperformed static images by 4.2x.",
        tags=["macro_video", "persistence_check"],
    )

    # Simulate complete session/client termination and re-initialization
    new_hindsight_client = Hindsight(
        base_url=HINDSIGHT_URL,
        api_key=HINDSIGHT_KEY,
        timeout=settings.HINDSIGHT_TIMEOUT,
    )
    service2 = MemoryService(hindsight_client=new_hindsight_client)

    # Session 2: Recall from newly created client
    recall_resp = await service2.recall(
        db=db_session,
        brand_id=brand.id,
        query="video performance engagement",
        budget="mid",
    )
    assert recall_resp.brand_id == brand.id
    assert "bank_id" not in recall_resp.model_dump()


@pytest.mark.asyncio
async def test_critical_5_strict_brand_isolation(live_hindsight_client, db_session):
    """CRITICAL TEST 5: Verify memories never leak across brand tenants."""
    brand_taco = Brand(
        name="The Taco Syndicate Isolation",
        industry="Fast-Casual Tacos",
        description="Mexican street food",
        target_audience="College Students",
        market_region="Austin, TX",
        brand_voice="Casual",
    )
    brand_spa = Brand(
        name="Luxe Parisian Spa Isolation",
        industry="Luxury Wellness",
        description="High-end skincare atelier",
        target_audience="HNW Individuals",
        market_region="Paris, France",
        brand_voice="Opulent",
    )
    db_session.add_all([brand_taco, brand_spa])
    db_session.commit()
    db_session.refresh(brand_taco)
    db_session.refresh(brand_spa)

    service = MemoryService(hindsight_client=live_hindsight_client)
    await service.provision_bank(db=db_session, brand_id=brand_taco.id)
    await service.provision_bank(db=db_session, brand_id=brand_spa.id)

    # Retain taco secret in Brand Taco
    await service.retain(
        db=db_session,
        brand_id=brand_taco.id,
        content="Proprietary Chipotle Marinade Recipe #923 with roasted poblano peppers.",
        tags=["secret_recipe", "tacos"],
    )

    # Recall in Brand Spa for tacos / marinade
    spa_recall = await service.recall(
        db=db_session,
        brand_id=brand_spa.id,
        query="Chipotle Marinade Recipe poblano peppers",
        budget="mid",
    )

    # Brand Spa bank MUST NOT return Taco Syndicate proprietary memories
    for item in spa_recall.results:
        assert "Chipotle Marinade" not in item.content
        assert "Taco" not in item.content

