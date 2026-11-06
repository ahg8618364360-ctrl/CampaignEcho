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

