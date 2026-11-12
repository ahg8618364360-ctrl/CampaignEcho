from contextlib import asynccontextmanager
from urllib.parse import urlparse
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import CampaignEchoException, app_exception_handler
from backend.app.core.security import SESSION_COOKIE_NAME
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.brands import router as brands_router
from backend.app.api.v1.memory import router as memory_router
from backend.app.api.v1.campaigns import router as campaigns_router
from backend.app.api.v1.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    # Fail-closed auth secret validation
    from backend.app.core.config import validate_auth_secret
    validate_auth_secret()

    logger.info(
        "Starting CampaignEcho API in %s mode on %s:%s",
        settings.ENV,
        settings.BACKEND_HOST,
        settings.BACKEND_PORT,
    )
    yield
    logger.info("CampaignEcho API shutdown complete.")


def create_app() -> FastAPI:
    """Initialize and configure the CampaignEcho FastAPI application."""
    app = FastAPI(
        title="CampaignEcho API",
        description="Memory-Powered AI Marketing Intelligence Platform Backend",
        version=settings.VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # CSRF Origin / Referer Validation Middleware for state-changing requests
    @app.middleware("http")
    async def csrf_origin_protection(request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            allowed_origins = set(settings.CORS_ORIGINS)
            origin = request.headers.get("origin")
            if origin:
                if origin not in allowed_origins:
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": "CSRF verification failed: Untrusted request origin."},
                    )
            else:
                referer = request.headers.get("referer")
                has_cookie_auth = SESSION_COOKIE_NAME in request.cookies
                has_bearer_auth = "authorization" in {k.lower() for k in request.headers.keys()}
                if has_cookie_auth and not has_bearer_auth:
                    if referer:
                        parsed = urlparse(referer)
                        ref_origin = f"{parsed.scheme}://{parsed.netloc}"
                        if ref_origin not in allowed_origins:
                            return JSONResponse(
                                status_code=status.HTTP_403_FORBIDDEN,
                                content={"detail": "CSRF verification failed: Untrusted request referer."},
                            )
        return await call_next(request)

    # Custom Exception Handlers
    app.add_exception_handler(CampaignEchoException, app_exception_handler)

    # Route Registration under /api/v1
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(brands_router, prefix="/api/v1")
    app.include_router(memory_router, prefix="/api/v1")
    app.include_router(campaigns_router, prefix="/api/v1")

    @app.get("/", tags=["Root"])
    def root():
        return {
            "name": "CampaignEcho Intelligence API",
            "version": settings.VERSION,
            "status": "online",
            "docs": "/docs" if settings.DEBUG else "disabled",
        }

    return app


app = create_app()
