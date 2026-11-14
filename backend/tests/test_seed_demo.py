"""Unit tests for demonstration seeding safety and idempotency.

Tests:
- Idempotent execution (running twice creates zero duplicate fixtures).
- Collision refusal (refuses to seed synthetic campaigns into non-synthetic brands).
- Enforces is_synthetic=True on all seeded campaigns and brands.
- Verifies feedback is not retained to Hindsight (retained_to_hindsight=False).
"""

import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.base import Base
from backend.app.db.models import Brand, Campaign, CampaignFeedback
from scripts.seed_demo import seed_demo_data, DEMO_BRAND_NAME


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


def test_seed_demo_idempotency(test_db):
    """Running seed_demo_data multiple times produces no duplicate fixtures."""
    # First seed run
    seed_demo_data(db_session=test_db)
    brand = test_db.query(Brand).filter(Brand.name == DEMO_BRAND_NAME).first()
    assert brand is not None
    assert brand.is_synthetic is True
    initial_campaign_count = len(brand.campaigns)
    assert initial_campaign_count == 3

    # Second seed run (must be idempotent)
    seed_demo_data(db_session=test_db)
    test_db.refresh(brand)
    assert len(brand.campaigns) == initial_campaign_count


def test_seed_demo_refuses_non_synthetic_brand_collision(test_db):
    """Refuses to seed synthetic fixtures into a brand that is NOT explicitly synthetic."""
    # Pre-create an authentic (non-synthetic) brand with the same name
    real_brand = Brand(
        id=str(uuid.uuid4()),
        name=DEMO_BRAND_NAME,
        industry="Dining",
        description="Authentic restaurant chain",
        target_audience="General audience",
        market_region="Austin, TX",
        brand_voice="Professional",
        preferred_language="en",
        is_synthetic=False,
    )
    test_db.add(real_brand)
    test_db.commit()

    # Attempting to seed must raise ValueError
    with pytest.raises(ValueError, match="Unsafe brand collision"):
        seed_demo_data(db_session=test_db)

    # Ensure no campaigns were injected into the authentic brand
    test_db.refresh(real_brand)
    assert len(real_brand.campaigns) == 0


def test_seed_demo_synthetic_provenance(test_db):
    """All seeded campaigns and feedback must have explicit synthetic markers."""
    seed_demo_data(db_session=test_db)
    brand = test_db.query(Brand).filter(Brand.name == DEMO_BRAND_NAME).first()
    assert brand.is_synthetic is True

    campaigns = test_db.query(Campaign).filter(Campaign.brand_id == brand.id).all()
    assert len(campaigns) == 3
    for camp in campaigns:
        assert camp.is_synthetic is True
        feedback = test_db.query(CampaignFeedback).filter(CampaignFeedback.campaign_id == camp.id).first()
        assert feedback is not None
        assert feedback.retained_to_hindsight is False
        assert feedback.hindsight_memory_id is None
        assert "[SYNTHETIC DEMO FIXTURE]" in feedback.content
