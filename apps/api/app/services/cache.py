import json
import logging
import time
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback in-memory cache with TTL timestamps
_MEMORY_CACHE: dict = {}

_redis_client = None

async def _get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            import redis.asyncio as aioredis
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=1.0,
                socket_timeout=1.0
            )
            # Test ping
            await _redis_client.ping()
            logger.info("Connected to Redis at %s", settings.REDIS_URL)
        except Exception as e:
            logger.debug("Redis unavailable at %s (%s). Using thread-safe in-memory cache.", settings.REDIS_URL, e)
            _redis_client = False
    return _redis_client if _redis_client is not False else None

async def get_cache(key: str) -> Optional[Any]:
    """Retrieve item from Redis or local in-memory fallback."""
    try:
        r = await _get_redis()
        if r:
            val = await r.get(key)
            if val is not None:
                try:
                    return json.loads(val)
                except Exception:
                    return val
    except Exception as e:
        logger.debug("Redis get error for key %s: %s", key, e)

    # Local fallback
    entry = _MEMORY_CACHE.get(key)
    if not entry:
        return None
    val, expiry = entry
    if time.time() > expiry:
        del _MEMORY_CACHE[key]
        return None
    return val

async def set_cache(key: str, value: Any, ttl: int = 3600) -> bool:
    """Store item in Redis or local in-memory fallback with TTL (seconds)."""
    serialized = json.dumps(value) if not isinstance(value, str) else value
    try:
        r = await _get_redis()
        if r:
            await r.set(key, serialized, ex=ttl)
            return True
    except Exception as e:
        logger.debug("Redis set error for key %s: %s", key, e)

    # Local fallback
    _MEMORY_CACHE[key] = (value, time.time() + ttl)
    return True

async def delete_cache(key: str) -> bool:
    """Evict item from cache."""
    try:
        r = await _get_redis()
        if r:
            await r.delete(key)
    except Exception:
        pass
    if key in _MEMORY_CACHE:
        del _MEMORY_CACHE[key]
    return True
