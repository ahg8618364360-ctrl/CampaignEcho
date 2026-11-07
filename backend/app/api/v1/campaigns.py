from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.campaign import (
    CampaignBriefInput,
    CampaignResponse,
    CampaignResultSubmission,
    LearningLoopClosedResponse,
    CampaignComparisonRequest,
    CampaignComparisonResponse,
)
from backend.app.services.campaign_service import CampaignService, get_campaign_service

router = APIRouter(prefix="/campaigns", tags=["Campaigns & Learning Loop"])


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
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignResponse:
    return await service.generate_campaign(db=db, brief=brief, preferred_provider=preferred_provider)


@router.get(
    "",
    response_model=List[CampaignResponse],
    summary="List campaigns",
    description="Retrieve all stored campaigns with optional brand isolation filtering.",
)
def list_campaigns(
    brand_id: Optional[str] = Query(None, description="Filter campaigns by brand ID"),
    db: Session = Depends(get_db),
    service: CampaignService = Depends(get_campaign_service),
) -> List[CampaignResponse]:
    campaigns = service.list_campaigns(db=db, brand_id=brand_id)
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
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignComparisonResponse:
    return await service.compare_strategies(db=db, request=request)


@router.get(
    "/compare",
    response_model=List[CampaignComparisonResponse],
    summary="List stored campaign comparisons",
    description="Retrieve historical A/B comparison records with optional brand isolation filter.",
)
def list_campaign_comparisons(
    brand_id: Optional[str] = Query(None, description="Filter comparisons by brand ID"),
    db: Session = Depends(get_db),
    service: CampaignService = Depends(get_campaign_service),
) -> List[CampaignComparisonResponse]:
    return service.list_comparisons(db=db, brand_id=brand_id)


@router.get(
    "/compare/{comparison_id}",
    response_model=CampaignComparisonResponse,
    summary="Get campaign comparison by ID",
    description="Retrieve a stored Memory Evolution comparison record by its unique identifier.",
)
def get_campaign_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignComparisonResponse:
    return service.get_comparison(db=db, comparison_id=comparison_id)


@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
    summary="Get campaign details",
    description="Retrieve full details for a campaign including metrics, feedback, and strategy output.",
)
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    service: CampaignService = Depends(get_campaign_service),
) -> CampaignResponse:
    campaign = service.get_campaign(db=db, campaign_id=campaign_id)
    return CampaignResponse.model_validate(campaign)


@router.post(
    "/{campaign_id}/results",
    response_model=LearningLoopClosedResponse,
    summary="Submit campaign results & close Hindsight learning loop",
    description="Ingest observed campaign performance metrics and lessons learned, retain the experience into "
                "Vectorize Hindsight, and actively verify immediate recall retrievability.",
)
async def submit_campaign_results(
    campaign_id: str,
    results: CampaignResultSubmission,
    db: Session = Depends(get_db),
    service: CampaignService = Depends(get_campaign_service),
) -> LearningLoopClosedResponse:
    return await service.record_results_and_close_loop(db=db, campaign_id=campaign_id, results=results)
