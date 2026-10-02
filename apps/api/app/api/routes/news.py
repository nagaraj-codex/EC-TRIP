from fastapi import APIRouter, Query

from app.services.providers.news import news_provider

router = APIRouter(prefix="/news", tags=["Park Updates"])


@router.get("")
async def list_news(park_id: str | None = Query(default=None)):
    result = await news_provider.updates(park_id)
    return {
        "status": result.status,
        "source": result.source,
        "fetched_at": result.fetched_at,
        "error": result.error,
        "data": result.items,
    }
