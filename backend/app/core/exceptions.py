from fastapi import Request
from fastapi.responses import JSONResponse
from backend.app.core.logging import logger


class CampaignEchoException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 400, detail: str = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.detail = detail or message


async def app_exception_handler(request: Request, exc: CampaignEchoException) -> JSONResponse:
    """Handle custom application exceptions."""
    logger.warning("Application error: %s (Status: %s)", exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": "https://errors.campaignecho.local/error",
            "title": exc.message,
            "status": exc.status_code,
            "detail": exc.detail,
            "instance": str(request.url),
        },
    )

