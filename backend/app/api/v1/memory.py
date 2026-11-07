from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.memory import (
    BankProvisionRequest,
    BankProvisionResponse,
    MemoryActivityResponse,
    MemoryRecallRequest,
    MemoryRecallResponse,
    MemoryReflectRequest,
    MemoryReflectResponse,
    MemoryRetainRequest,
    MemoryRetainResponse,
    MemoryStatusResponse,
)
from backend.app.services.memory_service import MemoryService

router = APIRouter(prefix="/brands/{brand_id}/memory", tags=["Hindsight Memory Engine"])

_default_memory_service = MemoryService()


def get_memory_service() -> MemoryService:
    """Dependency provider for MemoryService."""
    return _default_memory_service


@router.post(
    "/provision",
    response_model=BankProvisionResponse,
    status_code=status.HTTP_200_OK,
    summary="Provision Brand Memory Bank",
)
async def provision_bank(
    brand_id: str,
    payload: Optional[BankProvisionRequest] = None,
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Idempotently provisions a dedicated Vectorize Hindsight memory bank for the brand."""
    p = payload or BankProvisionRequest()
    return await service.provision_bank(
        db=db,
        brand_id=brand_id,
        name=p.name,
        mission=p.mission,
        retain_mission=p.retain_mission,
        reflect_mission=p.reflect_mission,
    )


@router.post(
    "/retain",
    response_model=MemoryRetainResponse,
    status_code=status.HTTP_200_OK,
    summary="Retain Campaign Experience",
)
async def retain_memory(
    brand_id: str,
    payload: MemoryRetainRequest,
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Asynchronously stores a campaign observation, post-mortem feedback, or brand rule into memory."""
    return await service.retain(
        db=db,
        brand_id=brand_id,
        content=payload.content,
        context=payload.context,
        document_id=payload.document_id,
        metadata=payload.metadata,
        tags=payload.tags,
        entities=payload.entities,
        is_synthetic=payload.is_synthetic,
        source_type=payload.source_type,
        campaign_id=payload.campaign_id,
        verification_run_id=payload.verification_run_id,
    )


@router.post(
    "/recall",
    response_model=MemoryRecallResponse,
    status_code=status.HTTP_200_OK,
    summary="Recall Historical Memories",
)
async def recall_memories(
    brand_id: str,
    payload: MemoryRecallRequest,
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Contextually retrieves relevant historical memories from the brand's dedicated bank."""
    return await service.recall(
        db=db,
        brand_id=brand_id,
        query=payload.query,
        types=payload.types,
        budget=payload.budget,
        max_tokens=payload.max_tokens,
        tags=payload.tags,
        tags_match=payload.tags_match,
        verification_run_id=payload.verification_run_id,
    )


@router.post(
    "/reflect",
    response_model=MemoryReflectResponse,
    status_code=status.HTTP_200_OK,
    summary="Reflect over Brand Experience",
)
async def reflect_memory(
    brand_id: str,
    payload: MemoryReflectRequest,
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Synthesizes high-level marketing guidelines and recurring patterns across historical experiences."""
    return await service.reflect(
        db=db,
        brand_id=brand_id,
        query=payload.query,
        budget=payload.budget,
        context=payload.context,
        tags=payload.tags,
        verification_run_id=payload.verification_run_id,
    )


@router.post(
    "/verify",
    status_code=status.HTTP_200_OK,
    summary="Execute Correlated Memory Operations Verification Suite",
)
async def verify_brand_memory_operations(
    brand_id: str,
    verification_run_id: Optional[str] = Query(None, description="Optional custom verification run ID"),
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Executes a correlated verification suite (RETAIN, RECALL, REFLECT) ensuring all 3 succeed."""
    return await service.run_verification_suite(
        db=db,
        brand_id=brand_id,
        verification_run_id=verification_run_id,
    )


@router.get(
    "/status",
    response_model=MemoryStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Memory Bank Status",
)
async def get_memory_status(
    brand_id: str,
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Inspects live readiness, bank provisioning status, and Hindsight connectivity."""
    return await service.get_status(db=db, brand_id=brand_id)


@router.get(
    "/activity",
    response_model=MemoryActivityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Memory Telemetry Activity",
)
def get_memory_activity(
    brand_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Retrieves privacy-preserving operational audit telemetry for the brand's memory operations."""
    return service.get_activity_logs(db=db, brand_id=brand_id, limit=limit)


@router.get(
    "/explore",
    status_code=status.HTTP_200_OK,
    summary="Explore Brand Memory Records and Telemetry",
)
async def explore_brand_memories(
    brand_id: str,
    query: str = Query("campaign marketing audience performance", description="Search query for memory recall"),
    db: Session = Depends(get_db),
    service: MemoryService = Depends(get_memory_service),
):
    """Retrieve live memories, engine status, and operational activity for Memory Explorer."""
    status_resp = await service.get_status(db=db, brand_id=brand_id)
    activity_resp = service.get_activity_logs(db=db, brand_id=brand_id, limit=20)

    live_records = []
    if status_resp.bank_provisioned and status_resp.has_api_key:
        try:
            recall_res = await service.recall(
                db=db,
                brand_id=brand_id,
                query=query,
                budget="mid",
            )
            for item in recall_res.results:
                is_synth = False
                if item.metadata and isinstance(item.metadata, dict):
                    is_synth = item.metadata.get("is_synthetic", False)

                live_records.append({
                    "id": item.id or "mem-live",
                    "content": item.content,
                    "tags": item.tags or ["hindsight-cloud", "live-memory"],
                    "provenance": "Vectorize Hindsight Cloud",
                    "is_synthetic": is_synth,
                    "score": item.score or 0.95,
                    "timestamp": item.timestamp or status_resp.verified_at,
                    "category": "Observed Performance" if not is_synth else "Verified Ingested Memory",
                })
        except Exception as exc:
            from backend.app.core.logging import logger
            logger.warning("Live memory explore recall failed: %s", exc)

    return {
        "brand_id": brand_id,
        "status": status_resp.model_dump(),
        "live_records": live_records,
        "activities": [a.model_dump() for a in activity_resp.activities],
    }


