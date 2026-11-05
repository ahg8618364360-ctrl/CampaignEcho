from decimal import Decimal
from backend.app.db.models import Brand, Campaign, CampaignMetrics, CampaignFeedback


def test_brand_creation_and_synthetic_flag(db_session):
    """Test Brand model creation with default synthetic flag."""
    brand = Brand(
        name="The Taco Syndicate",
        industry="Dining",
        description="Authentic tacos",
        target_audience="Students",
        market_region="Austin, TX",
        brand_voice="Energetic",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    assert brand.id is not None
    assert brand.name == "The Taco Syndicate"
    assert brand.is_synthetic is True
    assert brand.hindsight_bank_id is None  # Nullable in M1


def test_campaign_metrics_decimal_and_nullable(db_session):
    """Test Campaign and CampaignMetrics with decimal-safe financial fields and nullable counts."""
    brand = Brand(
        name="Test Brand",
        industry="Retail",
        description="Clothing",
        target_audience="Young Adults",
        market_region="US",
        brand_voice="Casual",
    )
    db_session.add(brand)
    db_session.commit()

    campaign = Campaign(
        brand_id=brand.id,
        name="Winter Kickoff",
        brief="Promote jackets",
        objective="Sales",
        platform="Instagram",
        is_synthetic=False,
    )
    db_session.add(campaign)
    db_session.commit()

    metrics = CampaignMetrics(
        campaign_id=campaign.id,
        budget=Decimal("450.50"),
        spend=Decimal("412.75"),
        currency="USD",
        impressions=None,  # Nullable when unmeasured
        reach=None,
        clicks=120,
        conversions=45,
        offer_redemptions=None,
        cost_per_acquisition=Decimal("9.17"),
        roas=Decimal("3.85"),
        primary_kpi="Conversions",
    )
    db_session.add(metrics)
    db_session.commit()
    db_session.refresh(metrics)

    assert metrics.spend == Decimal("412.75")
    assert metrics.currency == "USD"
    assert metrics.impressions is None  # Accurately stores unknown metric as None
    assert metrics.clicks == 120
    assert metrics.cost_per_acquisition == Decimal("9.17")


def test_cascade_deletion(db_session):
    """Test that deleting a Brand cascades to Campaigns, Metrics, and Feedback."""
    brand = Brand(
        name="Temporary Brand",
        industry="Tech",
        description="SaaS",
        target_audience="Devs",
        market_region="Global",
        brand_voice="Direct",
    )
    db_session.add(brand)
    db_session.commit()

    campaign = Campaign(
        brand_id=brand.id,
        name="Alpha Launch",
        brief="Launch announcement",
        objective="Awareness",
        platform="Twitter",
    )
    db_session.add(campaign)
    db_session.commit()

    feedback = CampaignFeedback(
        campaign_id=campaign.id,
        feedback_type="POST_MORTEM",
        content="Great engagement",
        lessons_learned="Thread format worked best",
    )
    db_session.add(feedback)
    db_session.commit()

    # Delete brand
    db_session.delete(brand)
    db_session.commit()

    # Verify cascades
    assert db_session.query(Campaign).filter_by(brand_id=brand.id).first() is None
    assert db_session.query(CampaignFeedback).filter_by(id=feedback.id).first() is None

