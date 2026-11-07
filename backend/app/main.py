from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import CampaignEchoException, app_exception_handler
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.brands import router as brands_router
from backend.app.api.v1.memory import router as memory_router
from backend.app.api.v1.campaigns import router as campaigns_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
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

    # Custom Exception Handlers
    app.add_exception_handler(CampaignEchoException, app_exception_handler)

    # Route Registration under /api/v1
    app.include_router(health_router, prefix="/api/v1")
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
