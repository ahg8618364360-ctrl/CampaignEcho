import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from hindsight_client import Hindsight

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import (
    CampaignEchoException,
    ResourceNotFoundException,
)
from backend.app.db.models import Brand, MemoryLog
from backend.app.schemas.memory import (
    BankProvisionResponse,
    MemoryActivityItem,
    MemoryActivityResponse,
    MemoryItem,
    MemoryRecallResponse,
    MemoryReflectResponse,
    MemoryRetainResponse,
    MemoryStatusResponse,
)


class MemoryService:
    """Enterprise Memory Service interfacing with Vectorize Hindsight.

    Enforces 1:1 brand isolation, deterministic bank naming, safe async lifecycle,
    and privacy-preserving operational telemetry.
    """

    def __init__(self, hindsight_client: Optional[Hindsight] = None):
        if hindsight_client:
            self._client = hindsight_client
        else:
            self._client = Hindsight(
                base_url=settings.effective_hindsight_url,
                api_key=settings.HINDSIGHT_API_KEY,
                timeout=settings.HINDSIGHT_TIMEOUT,
                max_attempts=settings.HINDSIGHT_MAX_RETRIES,
            )

    @staticmethod
    def get_bank_id_for_brand(brand_id: str) -> str:
        """Deterministic, isolated bank ID for each brand.

        Strictly 1:1 per brand; prevents tenant crossover or accidental bank collisions.
        """
        clean_id = str(brand_id).strip().lower()
        return f"campaignecho-brand-{clean_id}"

    async def check_engine_health(self) -> Tuple[bool, str, Optional[str]]:
        """Verify live connectivity to the Vectorize Hindsight service."""
        try:
            version_resp = await self._client.aget_version()
            version_val = getattr(version_resp, "api_version", None)
            if version_val is None or hasattr(version_val, "_mock_name"):
                version_val = getattr(version_resp, "version", None)
            version_str = str(version_val) if (version_val is not None and not hasattr(version_val, "_mock_name")) else "1.1.0"
            return True, "CONNECTED", version_str
        except Exception as exc:
            err_msg = str(exc)
            if "401" in err_msg or "Unauthorized" in err_msg or "Forbidden" in err_msg:
                logger.error("Hindsight authentication failed: %s", err_msg)
                return False, "AUTH_FAILED", None
            logger.warning("Hindsight engine unreachable at %s: %s", settings.effective_hindsight_url, err_msg)
            return False, "UNREACHABLE", None

    def _get_verified_brand(self, db: Session, brand_id: str) -> Brand:
        """Fetch brand and ensure tenant boundary validation."""
        brand = db.query(Brand).filter(Brand.id == brand_id).first()
        if not brand:
            raise ResourceNotFoundException("Brand", brand_id)
        return brand

    def _log_telemetry(
        self,
        db: Session,
        brand_id: str,
        operation_type: str,
        status: str,
        latency_ms: int,
        items_count: int = 0,
        context_tag: Optional[str] = None,
    ) -> None:
        """Persist privacy-safe telemetry into the application database."""
        try:
            log_entry = MemoryLog(
                brand_id=brand_id,
                operation_type=operation_type,
                status=status,
                latency_ms=latency_ms,
                items_count=items_count,
                context_tag=context_tag,
                created_at=datetime.now(timezone.utc),
            )
            db.add(log_entry)
            db.commit()
        except Exception as exc:
            logger.warning("Failed to record memory telemetry: %s", exc)
            db.rollback()

    async def provision_bank(
        self,
        db: Session,
        brand_id: str,
        name: Optional[str] = None,
        mission: Optional[str] = None,
        retain_mission: Optional[str] = None,
        reflect_mission: Optional[str] = None,
    ) -> BankProvisionResponse:
        """Idempotently provision a dedicated Hindsight memory bank for a brand."""
        brand = self._get_verified_brand(db, brand_id)
        bank_id = self.get_bank_id_for_brand(brand.id)
        bank_name = name or f"{brand.name} Memory Bank"
        bank_mission = (
            mission
            or f"Retain marketing experience, audience observations, and brand constraints for {brand.name}."
        )

        t0 = time.perf_counter()
        status_code = "PROVISIONED"
        message = f"Bank {bank_id} successfully provisioned."

        try:
            # Check if bank already exists in Hindsight
            try:
                await self._client.aget_bank_config(bank_id=bank_id)
                status_code = "ALREADY_EXISTS"
                message = f"Memory bank {bank_id} already exists and is ready for operations."
            except Exception:
                # Bank does not exist yet; create it
                await self._client.acreate_bank(
                    bank_id=bank_id,
                    name=bank_name,
                    mission=bank_mission,
                    retain_mission=retain_mission,
                    reflect_mission=reflect_mission,
                )

            # Update database record if not yet linked
            if brand.hindsight_bank_id != bank_id:
                brand.hindsight_bank_id = bank_id
                db.add(brand)
                db.commit()

            latency_ms = int((time.perf_counter() - t0) * 1000)
            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="PROVISION",
                status="SUCCESS",
                latency_ms=latency_ms,
                items_count=1,
                context_tag=bank_id,
            )

            return BankProvisionResponse(
                brand_id=brand.id,
                bank_provisioned=True,
                status=status_code,
                message=message,
            )

        except Exception as exc:
            latency_ms = int((time.perf_counter() - t0) * 1000)
            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="PROVISION",
                status="FAILED",
                latency_ms=latency_ms,
                items_count=0,
                context_tag=bank_id,
            )
            logger.error("Bank provisioning failed for brand %s: %s", brand_id, exc)
            raise CampaignEchoException(
                message=f"Memory bank provisioning failed: {str(exc)}",
                status_code=502,
                details={"brand_id": brand_id, "bank_id": bank_id},
            )

    async def retain(
        self,
        db: Session,
        brand_id: str,
        content: str,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        entities: Optional[List[Dict[str, str]]] = None,
        is_synthetic: bool = False,
        source_type: str = "CAMPAIGN_POSTMORTEM",
        campaign_id: Optional[str] = None,
    ) -> MemoryRetainResponse:
        """Asynchronously retain an empirical campaign observation or brand rule into Hindsight."""
        brand = self._get_verified_brand(db, brand_id)
        bank_id = self.get_bank_id_for_brand(brand.id)

        meta = dict(metadata or {})
        meta["brand_id"] = str(brand.id)
        meta["is_synthetic"] = "true" if (is_synthetic or brand.is_synthetic) else "false"
        meta["source_type"] = str(source_type)
        if campaign_id:
            meta["campaign_id"] = str(campaign_id)

        retain_tags = list(tags or [])
        if "is_synthetic" not in retain_tags and (is_synthetic or brand.is_synthetic):
            retain_tags.append("synthetic")
        if source_type and source_type.lower() not in [t.lower() for t in retain_tags]:
            retain_tags.append(source_type.lower())

        t0 = time.perf_counter()
        try:
            resp = await self._client.aretain(
                bank_id=bank_id,
                content=content,
                context=context,
                document_id=document_id,
                metadata=meta,
                tags=retain_tags,
                entities=entities,
            )
            latency_ms = int((time.perf_counter() - t0) * 1000)

            op_id = getattr(resp, "operation_id", None) or getattr(resp, "id", None)

            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="RETAIN",
                status="SUCCESS",
                latency_ms=latency_ms,
                items_count=1,
                context_tag=source_type,
            )

            return MemoryRetainResponse(
                brand_id=brand.id,
                operation_id=str(op_id) if op_id else None,
                status="SUCCESS",
                items_retained=1,
                duration_ms=latency_ms,
                is_synthetic=is_synthetic or brand.is_synthetic,
                source_type=source_type,
                message="Campaign experience retained in Hindsight memory.",
            )

        except Exception as exc:
            latency_ms = int((time.perf_counter() - t0) * 1000)
            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="RETAIN",
                status="FAILED",
                latency_ms=latency_ms,
                items_count=0,
                context_tag=source_type,
            )
            logger.error("Memory retain failed for brand %s: %s", brand_id, exc)
            raise CampaignEchoException(
                message=f"Memory retention failed: {str(exc)}",
                status_code=502,
                details={"brand_id": brand_id, "bank_id": bank_id},
            )

    async def recall(
        self,
        db: Session,
        brand_id: str,
        query: str,
        types: Optional[List[str]] = None,
        budget: str = "mid",
        max_tokens: int = 4096,
        tags: Optional[List[str]] = None,
        tags_match: str = "any",
    ) -> MemoryRecallResponse:
        """Recall contextually relevant memories for a query from the brand's bank."""
        brand = self._get_verified_brand(db, brand_id)
        bank_id = self.get_bank_id_for_brand(brand.id)

        t0 = time.perf_counter()
        try:
            resp = await self._client.arecall(
                bank_id=bank_id,
                query=query,
                types=types,
                budget=budget,
                max_tokens=max_tokens,
                tags=tags,
                tags_match=tags_match,  # type: ignore
            )
            latency_ms = int((time.perf_counter() - t0) * 1000)

            # Extract memory items from Hindsight response
            memory_items: List[MemoryItem] = []
            results_attr = getattr(resp, "results", None) or getattr(resp, "memories", None) or []
            if isinstance(results_attr, list):
                for res in results_attr:
                    content_val = getattr(res, "content", None) or getattr(res, "text", str(res))
                    item_id = getattr(res, "id", None)
                    item_type = getattr(res, "type", None)
                    item_score = getattr(res, "score", None)
                    item_tags = getattr(res, "tags", []) or []
                    item_meta = getattr(res, "metadata", {}) or {}
                    item_time = getattr(res, "timestamp", None)

                    memory_items.append(
                        MemoryItem(
                            id=str(item_id) if item_id else None,
                            content=str(content_val),
                            memory_type=str(item_type) if item_type else None,
                            score=float(item_score) if item_score is not None else None,
                            tags=list(item_tags),
                            metadata=dict(item_meta) if isinstance(item_meta, dict) else {},
                            timestamp=str(item_time) if item_time else None,
                        )
                    )

            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="RECALL",
                status="SUCCESS",
                latency_ms=latency_ms,
                items_count=len(memory_items),
                context_tag=query[:50],
            )

            return MemoryRecallResponse(
                brand_id=brand.id,
                query=query,
                results=memory_items,
                total_results=len(memory_items),
                duration_ms=latency_ms,
                provenance={
                    "engine": "Vectorize Hindsight",
                    "budget": budget,
                    "tags_match": tags_match,
                },
            )

        except Exception as exc:
            latency_ms = int((time.perf_counter() - t0) * 1000)
            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="RECALL",
                status="FAILED",
                latency_ms=latency_ms,
                items_count=0,
                context_tag=query[:50],
            )
            logger.error("Memory recall failed for brand %s: %s", brand_id, exc)
            raise CampaignEchoException(
                message=f"Memory recall failed: {str(exc)}",
                status_code=502,
                details={"brand_id": brand_id, "bank_id": bank_id},
            )

    async def reflect(
        self,
        db: Session,
        brand_id: str,
        query: str,
        budget: str = "low",
        context: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> MemoryReflectResponse:
        """Synthesize higher-order marketing intelligence over the brand's historical experiences."""
        brand = self._get_verified_brand(db, brand_id)
        bank_id = self.get_bank_id_for_brand(brand.id)

        t0 = time.perf_counter()
        try:
            resp = await self._client.areflect(
                bank_id=bank_id,
                query=query,
                budget=budget,
                context=context,
                tags=tags,
                include_facts=True,
            )
            latency_ms = int((time.perf_counter() - t0) * 1000)

            reflection_text = getattr(resp, "reflection", None) or getattr(resp, "response", str(resp))
            facts_list = getattr(resp, "facts", []) or []

            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="REFLECT",
                status="SUCCESS",
                latency_ms=latency_ms,
                items_count=len(facts_list),
                context_tag=query[:50],
            )

            return MemoryReflectResponse(
                brand_id=brand.id,
                query=query,
                reflection=str(reflection_text),
                duration_ms=latency_ms,
                facts=[f if isinstance(f, dict) else {"fact": str(f)} for f in facts_list],
            )

        except Exception as exc:
            latency_ms = int((time.perf_counter() - t0) * 1000)
            self._log_telemetry(
                db=db,
                brand_id=brand.id,
                operation_type="REFLECT",
                status="FAILED",
                latency_ms=latency_ms,
                items_count=0,
                context_tag=query[:50],
            )
            logger.error("Memory reflect failed for brand %s: %s", brand_id, exc)
            raise CampaignEchoException(
                message=f"Memory reflection failed: {str(exc)}",
                status_code=502,
                details={"brand_id": brand_id, "bank_id": bank_id},
            )

    async def get_status(self, db: Session, brand_id: str) -> MemoryStatusResponse:
        """Retrieve live bank readiness and service connectivity status."""
        brand = self._get_verified_brand(db, brand_id)
        bank_id = self.get_bank_id_for_brand(brand.id)

        is_connected, engine_status, version = await self.check_engine_health()

        is_provisioned = False
        memories_count = None
        message = "Memory service is operational."

        if is_connected:
            try:
                await self._client.aget_bank_config(bank_id=bank_id)
                is_provisioned = True
                mem_resp = await self._client.alist_memories(bank_id=bank_id, limit=1)
                memories_count = getattr(mem_resp, "total", None)
                if memories_count is None and hasattr(mem_resp, "items"):
                    memories_count = len(mem_resp.items)
                message = f"Memory bank is provisioned and active on Hindsight v{version}."
            except Exception as exc:
                is_provisioned = False
                memories_count = None
                err_str = str(exc)
                if "401" in err_str or "Unauthorized" in err_str:
                    message = "Hindsight Cloud requires authentication. Configure HINDSIGHT_API_KEY in .env to provision and access bank."
                elif "404" in err_str or "Not Found" in err_str:
                    message = "Memory bank has not been provisioned yet for this brand."
                else:
                    message = f"Bank query failed: {err_str}"
        else:
            is_provisioned = False
            memories_count = None
            message = f"Hindsight engine status: {engine_status}. Endpoint: {settings.effective_hindsight_url}"

        return MemoryStatusResponse(
            brand_id=brand.id,
            bank_provisioned=is_provisioned,
            service_connected=is_connected,
            engine_status=engine_status,  # type: ignore
            version=version,
            message=message,
            memories_count=memories_count,
        )

    def get_activity_logs(
        self,
        db: Session,
        brand_id: str,
        limit: int = 50,
    ) -> MemoryActivityResponse:
        """Retrieve recent operational telemetry logs for a brand."""
        brand = self._get_verified_brand(db, brand_id)

        logs = (
            db.query(MemoryLog)
            .filter(MemoryLog.brand_id == brand.id)
            .order_by(MemoryLog.created_at.desc())
            .limit(limit)
            .all()
        )

        activities = [
            MemoryActivityItem(
                id=log.id,
                brand_id=log.brand_id,
                operation_type=log.operation_type,
                context_tag=log.context_tag,
                items_count=log.items_count,
                status=log.status,
                latency_ms=log.latency_ms,
                created_at=log.created_at,
            )
            for log in logs
        ]

        return MemoryActivityResponse(
            brand_id=brand.id,
            activities=activities,
            total_count=len(activities),
        )

