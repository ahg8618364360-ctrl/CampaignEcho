from typing import Any, Dict, Optional
from fastapi import Request
from fastapi.responses import JSONResponse
from backend.app.core.logging import logger


class CampaignEchoException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        detail: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.detail = detail or message
        self.details = details or {}


class ResourceNotFoundException(CampaignEchoException):
    """Exception raised when a requested resource is not found."""

    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} with ID '{resource_id}' not found.",
            status_code=404,
            detail=f"{resource_type} with ID '{resource_id}' was not found in the database.",
            details={"resource_type": resource_type, "resource_id": resource_id},
        )


async def app_exception_handler(request: Request, exc: CampaignEchoException) -> JSONResponse:
    """Handle custom application exceptions."""
    logger.warning("Application error: %s (Status: %s)", exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": "https://errors.campaignecho.local/error",
            "title": exc.message,
            "message": exc.message,
            "status": exc.status_code,
            "detail": exc.detail,
            "details": exc.details,
            "instance": str(request.url),
        },
    )
