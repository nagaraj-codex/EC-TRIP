from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.recommendation import router as recommendation_router
from app.api.routes.feedback import router as feedback_router
from app.api.routes.chat import router as chat_router
from app.api.routes.parks import router as parks_router
from app.api.routes.telemetry import router as telemetry_router
from app.api.routes.itinerary import router as itinerary_router
from app.api.routes.download import router as download_router
from app.api.routes.auth import router as auth_router
from app.api.routes.trips import router as trips_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.news import router as news_router
from app.api.ws import router as ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance theme park crowd intelligence, dynamic tariff optimization, and FastTrack ROI engine.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation_router, prefix=settings.API_V1_STR)
app.include_router(feedback_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(parks_router, prefix=settings.API_V1_STR)
app.include_router(telemetry_router, prefix=settings.API_V1_STR)
app.include_router(itinerary_router, prefix=settings.API_V1_STR)
app.include_router(download_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(trips_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(news_router, prefix=settings.API_V1_STR)
app.include_router(ws_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)  # Also mount at root for /ws


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "active_parks": list(settings.PARK_COORDINATES.keys()),
        "caching": "Redis/Memory (TTL 3600s)",
        "telemetry_ws": f"{settings.API_V1_STR}/telemetry/ws",
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": "QueueCut v3.0 Intelligence API is running.",
        "version": settings.VERSION,
        "documentation": "/docs",
        "endpoints": {
            "parks": f"{settings.API_V1_STR}/parks",
            "recommendation": f"{settings.API_V1_STR}/recommendation/recommend",
            "telemetry_weather": f"{settings.API_V1_STR}/telemetry/weather",
            "telemetry_commute": f"{settings.API_V1_STR}/telemetry/commute",
            "telemetry_ws": f"{settings.API_V1_STR}/telemetry/ws",
            "itinerary": f"{settings.API_V1_STR}/itinerary/generate",
            "feedback": f"{settings.API_V1_STR}/feedback/report",
            "chat": f"{settings.API_V1_STR}/chat/ask",
            "download_export": f"{settings.API_V1_STR}/download/export",
        },
    }
