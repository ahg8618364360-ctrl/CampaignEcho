from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.session import get_db

router = APIRouter(prefix="/health", tags=["Health Diagnostics"])


@router.get("/live", status_code=status.HTTP_200_OK)
def liveness_check():
    """Verify application process is running and responsive."""
    return {"status": "alive"}


@router.get("/ready", status_code=status.HTTP_200_OK)
def readiness_check(db: Session = Depends(get_db)):
    """Verify required backing services (database) are operational."""
    try:
        db.execute(text("SELECT 1;"))
        return {
            "status": "ready",
            "database": "connected",
            "version": settings.VERSION,
        }
    except Exception as exc:
        logger.error("Database readiness check failed: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unready",
                "database": "disconnected",
                "error": "Database connection pool unreachable",
            },
        )

