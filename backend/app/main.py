import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
import app.models
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically ensure tables exist on startup if database server is reachable
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Conduit - Alumni Network & Professional Connections Platform",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    tags=["System"],
    summary="Application Health Check"
)
def health_check():
    """
    Returns application health status and current operational environment.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "project": settings.PROJECT_NAME
    }


@app.get(
    "/",
    status_code=status.HTTP_200_OK,
    tags=["System"],
    summary="Root Discovery Endpoint"
)
def root():
    """
    Landing endpoint providing navigation links to API documentation.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_check": "/health",
        "api_v1": settings.API_V1_STR,
    }


# ==============================================================================
# Meta WhatsApp Cloud API Webhook Dual-Failover Endpoints
# Handles verification challenge from Meta when routed through either backend or frontend
# ==============================================================================
@app.get("/api/whatsapp/webhook", tags=["WhatsApp"])
@app.get("/whatsapp/webhook", tags=["WhatsApp"])
async def whatsapp_webhook_verification(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    expected_token = os.environ.get("WA_VERIFY_TOKEN", "kin_meta_verify_token_2026")
    if mode == "subscribe" and token == expected_token:
        return Response(content=challenge or "OK", media_type="text/plain", status_code=200)
    return Response(content="Forbidden", media_type="text/plain", status_code=403)

