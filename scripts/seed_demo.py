#!/usr/bin/env python3
"""
CampaignEcho -- Deterministic Demonstration Data Seeding Script
Populates canonical demo fixtures for 'The Taco Syndicate' with explicit synthetic provenance.
Guarantees:
- Idempotent: safe to run multiple times without duplicating data.
- Refuses unsafe collisions: if a non-synthetic brand exists with the same name, aborts without modifying.
- Enforces synthetic provenance: all campaigns and feedback are marked synthetic.
- Does NOT retain synthetic fixtures to live Hindsight Cloud.
"""

import sys
import uuid
import json
from decimal import Decimal
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.db.session import SessionLocal
from backend.app.db.models import Brand, Campaign, CampaignMetrics, CampaignFeedback

DEMO_BRAND_NAME = "The Taco Syndicate"

CANONICAL_FIXTURES = [
    {
        "name": "Late Night Burrito Drops",
        "brief_text": "Late-night Instagram Reels campaign with flash codes and extreme close-up queso pours targeting Austin college students.",
        "objective": "Drive midnight walk-ins among West Campus students",
        "platform": "Instagram Reels",
        "status": "COMPLETED",
        "llm_provider": "zai",
        "llm_model": "glm-4.5-flash",
        "concept_data": {
            "offer": "Free loaded queso with any 2-taco box after 10 PM",
            "hook": "The only thing louder than your hunger is this queso pull",
            "flash_code": "QUESO22",
        },
        "strategy_output": {
            "campaign_concept": "Midnight Queso Drop: ASMR Sensory Late-Night Run",
            "main_objective": "Drive peak walk-in traffic between 11 PM and 1 AM",
            "historical_rationale": "High-performing historical benchmark for late-night student acquisition.",
        },
        "metrics": {
            "budget": Decimal("1200.00"),
            "spend": Decimal("1150.00"),
            "impressions": 48200,
            "reach": 39500,
            "clicks": 2190,
            "conversions": 389,
            "offer_redemptions": 389,
            "cost_per_acquisition": Decimal("2.96"),
            "roas": Decimal("4.06"),
            "primary_kpi": "offer_redemptions",
        },
        "feedback": {
            "feedback_type": "CAMPAIGN_POSTMORTEM",
            "content": "[SYNTHETIC DEMO FIXTURE] Campaign generated 48,200 impressions and 389 redemptions. Peak traffic occurred between 11 PM and 1 AM using the flash code QUESO22.",
            "lessons_learned": "Time-sensitive flash codes (11 PM - 1 AM) and ASMR cheese pulls are the single most reliable conversion mechanism for West Campus night owls.",
        },
    },
    {
        "name": "Gourmet Truffle Tasting",
        "brief_text": "Failed fine-dining experiment attempting to elevate street tacos with artisanal truffle sauce and white tablecloth aesthetics.",
        "objective": "Test luxury market positioning",
        "platform": "Instagram Reels",
        "status": "COMPLETED",
        "llm_provider": "zai",
        "llm_model": "glm-4.5-flash",
        "concept_data": {
            "offer": "$18 Truffle Taco Tasting Flight",
            "hook": "Elevate your palate with gourmet artisanal tacos",
        },
        "strategy_output": {
            "campaign_concept": "Artisanal Elegance: Elevated Street Food Experience",
            "main_objective": "Test luxury market viability",
            "historical_rationale": "Exploratory campaign testing upscale menu items.",
        },
        "metrics": {
            "budget": Decimal("1400.00"),
            "spend": Decimal("1400.00"),
            "impressions": 22100,
            "reach": 18200,
            "clicks": 410,
            "conversions": 34,
            "offer_redemptions": 34,
            "cost_per_acquisition": Decimal("41.18"),
            "roas": Decimal("0.44"),
            "primary_kpi": "conversions",
        },
        "feedback": {
            "feedback_type": "CAMPAIGN_POSTMORTEM",
            "content": "[SYNTHETIC DEMO FIXTURE] Campaign severely underperformed with only 34 conversions at a crippling $41.18 CPA. Student audience felt alienated.",
            "lessons_learned": "Strict negative heuristic: Never position The Taco Syndicate as fine-dining or luxury cuisine. Stick to authentic street food and value.",
        },
    },
    {
        "name": "Flash Student ID Redemption",
        "brief_text": "Mid-week loyalty activation offering $1 street tacos with valid student badge.",
        "objective": "Boost Tuesday afternoon lull traffic",
        "platform": "Instagram Reels",
        "status": "COMPLETED",
        "llm_provider": "zai",
        "llm_model": "glm-4.5-flash",
        "concept_data": {
            "offer": "$1 al pastor tacos 2 PM - 5 PM with student ID",
            "hook": "Your mid-week study break taco fix is $1",
        },
        "strategy_output": {
            "campaign_concept": "Taco Tuesday Study Break Fuel",
            "main_objective": "Fill afternoon capacity between lunch and dinner",
            "historical_rationale": "Volume-driven afternoon activation.",
        },
        "metrics": {
            "budget": Decimal("800.00"),
            "spend": Decimal("800.00"),
            "impressions": 31500,
            "reach": 26800,
            "clicks": 1420,
            "conversions": 278,
            "offer_redemptions": 278,
            "cost_per_acquisition": Decimal("2.88"),
            "roas": Decimal("3.06"),
            "primary_kpi": "offer_redemptions",
        },
        "feedback": {
            "feedback_type": "CAMPAIGN_POSTMORTEM",
            "content": "[SYNTHETIC DEMO FIXTURE] Successfully filled afternoon lull with 278 verified student redemptions. Kitchen bottlenecked between 2:00 and 2:30 PM.",
            "lessons_learned": "Clear price point ($1 taco) drives rapid word-of-mouth on campus group chats. Stagger arrival times to relieve counter congestion.",
        },
    },
]


def seed_demo_data(db_session=None):
    """Seed demo fixtures safely. Accepts an optional external session for testing."""
    close_session = False
    if db_session is None:
        db = SessionLocal()
        close_session = True
    else:
        db = db_session

    try:
        print("Checking demonstration brand provenance...")
        brand = db.query(Brand).filter(Brand.name == DEMO_BRAND_NAME).first()

        if brand:
            # Check provenance: must be explicitly synthetic
            if not getattr(brand, "is_synthetic", False):
                raise ValueError(
                    f"Unsafe brand collision: Found existing brand '{brand.name}' (ID: {brand.id}) "
                    f"with is_synthetic=False. Refusing to inject synthetic fixtures into an authentic brand."
                )
            print(f"  Verified synthetic brand '{brand.name}' exists (ID: {brand.id})")
        else:
            brand = Brand(
                id=str(uuid.uuid4()),
                name=DEMO_BRAND_NAME,
                industry="Fast-Casual Dining",
                description="Authentic street tacos, loaded queso, and breakfast tacos targeted at Austin college students.",
                target_audience="UT Austin college students (18-24) within 3 miles, value-conscious, late-night active.",
                market_region="Austin, TX (West Campus)",
                brand_voice="Energetic, authentic, witty, late-night street food culture, zero pretension.",
                preferred_language="en",
                restrictions="No high-end fine dining aesthetics; never discount alcohol; student hours focus.",
                is_synthetic=True,
            )
            db.add(brand)
            db.commit()
            db.refresh(brand)
            print(f"  Created synthetic brand '{brand.name}' (ID: {brand.id})")

        print("Checking demonstration fixtures...")
        seeded_count = 0
        for fixture in CANONICAL_FIXTURES:
            existing = (
                db.query(Campaign)
                .filter(Campaign.brand_id == brand.id, Campaign.name == fixture["name"])
                .first()
            )
            if existing:
                print(f"  Fixture '{fixture['name']}' already present (ID: {existing.id}). Skipping.")
                continue

            campaign = Campaign(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                name=fixture["name"],
                brief=fixture["brief_text"],
                objective=fixture["objective"],
                platform=fixture["platform"],
                status=fixture["status"],
                is_synthetic=True,
                memory_enabled=True,
                concept_data=fixture["concept_data"],
                strategy_output=fixture["strategy_output"],
                llm_provider=fixture["llm_provider"],
                llm_model=fixture["llm_model"],
            )
            db.add(campaign)
            db.flush()

            m_data = fixture["metrics"]
            metrics = CampaignMetrics(
                id=str(uuid.uuid4()),
                campaign_id=campaign.id,
                budget=m_data["budget"],
                spend=m_data["spend"],
                currency="USD",
                impressions=m_data["impressions"],
                reach=m_data["reach"],
                clicks=m_data["clicks"],
                conversions=m_data["conversions"],
                offer_redemptions=m_data["offer_redemptions"],
                cost_per_acquisition=m_data["cost_per_acquisition"],
                roas=m_data["roas"],
                primary_kpi=m_data["primary_kpi"],
            )
            db.add(metrics)

            f_data = fixture["feedback"]
            feedback = CampaignFeedback(
                id=str(uuid.uuid4()),
                campaign_id=campaign.id,
                feedback_type=f_data["feedback_type"],
                content=f_data["content"],
                lessons_learned=f_data["lessons_learned"],
                retained_to_hindsight=False,  # Local synthetic fixtures are never pushed to Hindsight
                hindsight_memory_id=None,
                created_at=datetime.now(timezone.utc),
            )
            db.add(feedback)
            seeded_count += 1
            print(f"  Seeded fixture '{fixture['name']}' (ID: {campaign.id})")

        db.commit()
        print(f"\nDemonstration seeding complete. Added {seeded_count} new fixtures. Brand total campaigns: {len(brand.campaigns)}")
        return 0
    except Exception as exc:
        db.rollback()
        print(f"Seeding failed: {exc}", file=sys.stderr)
        if close_session:
            sys.exit(1)
        raise
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    seed_demo_data()
