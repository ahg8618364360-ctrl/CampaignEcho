from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.db.session import get_db
from backend.app.db.models import Brand, Campaign, CampaignComparison, User
from backend.app.schemas.campaign import (
    CampaignBriefInput,
    CampaignResponse,
    CampaignResultSubmission,
    LearningLoopClosedResponse,
    CampaignComparisonRequest,
    CampaignComparisonResponse,
)
from backend.app.services.campaign_service import CampaignService, get_campaign_service
from backend.app.core.exceptions import ResourceNotFoundException
from backend.app.core.security import get_current_user, get_current_user_optional

router = APIRouter(prefix="/campaigns", tags=["Campaigns & Learning Loop"])


def _verify_brand_access(db: Session, brand_id: str, current_user: Optional[User]) -> Brand:
    """Verify caller has read access to the brand; raises 404 for nonexistent or foreign brands."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ResourceNotFoundException("Brand", brand_id)
    if current_user:
        if brand.user_id != current_user.id and not brand.is_synthetic:
            raise ResourceNotFoundException("Brand", brand_id)
    else:
        if not brand.is_synthetic:
            raise ResourceNotFoundException("Brand", brand_id)
    return brand


def _verify_owned_writable_brand(db: Session, brand_id: str, current_user: User) -> Brand:
    """Verify caller owns the brand and it is not an immutable synthetic benchmark."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ResourceNotFoundException("Brand", brand_id)
    if brand.is_synthetic:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Synthetic benchmark brand is immutable. Create your own business workspace to perform write operations.",
        )
    if brand.user_id != current_user.id:
        raise ResourceNotFoundException("Brand", brand_id)
    return brand


@router.post(
    "/generate",
    response_model=CampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a memory-informed marketing campaign",
    description="Loads brand profile, recalls prior experiences and reflections from Vectorize Hindsight, "
                "synthesizes strategy via LLM (Z.ai / Groq), and persists the campaign in SQLite.",
)
async def generate_campaign(
    brief: CampaignBriefInput,
    preferred_provider: Optional[str] = Query(None, description="Preferred LLM provider: 'zai', 'groq', or 'auto'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignResponse:
    _verify_owned_writable_brand(db, brief.brand_id, current_user)
    brief.is_synthetic = False
    return await service.generate_campaign(db=db, brief=brief, preferred_provider=preferred_provider)


@router.get(
    "",
    response_model=List[CampaignResponse],
    summary="List campaigns",
    description="Retrieve stored campaigns with strict tenant isolation filtering.",
)
def list_campaigns(
    brand_id: Optional[str] = Query(None, description="Filter campaigns by brand ID"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CampaignService = Depends(get_campaign_service),
) -> List[CampaignResponse]:
    if brand_id:
        _verify_brand_access(db, brand_id, current_user)
        campaigns = service.list_campaigns(db=db, brand_id=brand_id)
        return [CampaignResponse.model_validate(c) for c in campaigns]

    # Filter campaigns belonging to user's brands (or synthetic demo)
    query = db.query(Campaign).join(Brand, Campaign.brand_id == Brand.id)
    if current_user:
        query = query.filter(or_(Brand.user_id == current_user.id, Brand.is_synthetic == True))
    else:
        query = query.filter(Brand.is_synthetic == True)

    campaigns = query.order_by(Campaign.created_at.desc()).all()
    return [CampaignResponse.model_validate(c) for c in campaigns]


@router.post(
    "/compare",
    response_model=CampaignComparisonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Execute controlled Memory Evolution A/B comparison",
    description="Generates Mode A (zero-memory baseline) and Mode B (Hindsight memory-powered) strategies "
                "under identical model, prompt, and brief configurations, returning an empirical comparison ledger.",
)
async def compare_campaign_strategies(
    request: CampaignComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignComparisonResponse:
    _verify_owned_writable_brand(db, request.brand_id, current_user)
    return await service.compare_strategies(db=db, request=request)


@router.get(
    "/compare",
    response_model=List[CampaignComparisonResponse],
    summary="List stored campaign comparisons",
    description="Retrieve historical A/B comparison records filtered by tenant ownership.",
)
def list_campaign_comparisons(
    brand_id: Optional[str] = Query(None, description="Filter comparisons by brand ID"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CampaignService = Depends(get_campaign_service),
) -> List[CampaignComparisonResponse]:
    if brand_id:
        _verify_brand_access(db, brand_id, current_user)
        return service.list_comparisons(db=db, brand_id=brand_id)

    query = db.query(CampaignComparison).join(Brand, CampaignComparison.brand_id == Brand.id)
    if current_user:
        query = query.filter(or_(Brand.user_id == current_user.id, Brand.is_synthetic == True))
    else:
        query = query.filter(Brand.is_synthetic == True)

    comparisons = query.order_by(CampaignComparison.created_at.desc()).all()
    return [service.get_comparison(db=db, comparison_id=c.id) for c in comparisons]


@router.get(
    "/compare/{comparison_id}",
    response_model=CampaignComparisonResponse,
    summary="Get campaign comparison by ID",
    description="Retrieve a stored Memory Evolution comparison record with tenant boundary enforcement.",
)
def get_campaign_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignComparisonResponse:
    record = db.query(CampaignComparison).filter(CampaignComparison.id == comparison_id).first()
    if not record:
        raise ResourceNotFoundException("CampaignComparison", comparison_id)
    _verify_brand_access(db, record.brand_id, current_user)
    return service.get_comparison(db=db, comparison_id=comparison_id)


@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
    summary="Get campaign details",
    description="Retrieve full details for a campaign with tenant boundary enforcement.",
)
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignResponse:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", campaign_id)
    _verify_brand_access(db, campaign.brand_id, current_user)
    return CampaignResponse.model_validate(campaign)


@router.post(
    "/{campaign_id}/results",
    response_model=LearningLoopClosedResponse,
    summary="Submit campaign results & close Hindsight learning loop",
    description="Ingest observed campaign performance metrics and lessons learned, retain the experience into "
                "Vectorize Hindsight, and actively verify immediate recall retrievability. "
                "Synthetic benchmark campaigns are immutable and reject result submission.",
)
async def submit_campaign_results(
    campaign_id: str,
    results: CampaignResultSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CampaignService = Depends(get_campaign_service),
) -> LearningLoopClosedResponse:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", campaign_id)
    _verify_owned_writable_brand(db, campaign.brand_id, current_user)
    results.is_synthetic = False

    return await service.record_results_and_close_loop(db=db, campaign_id=campaign_id, results=results)
