import time
import httpx
from typing import Tuple, Optional, Dict, Any

_SCHEDULING_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 86400.0  # 24 Hours TTL for Public Holidays

def _get_cached(key: str) -> Any:
    if key in _SCHEDULING_CACHE:
        ts, data = _SCHEDULING_CACHE[key]
        if time.time() - ts < CACHE_TTL_SECONDS:
            return data
    return None

def _set_cached(key: str, data: Any):
    _SCHEDULING_CACHE[key] = (time.time(), data)

async def check_nager_holiday(year: int, date_str: str) -> Tuple[bool, Optional[str]]:
    cache_key = f"holiday_{year}_{date_str}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/IN"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                holidays = resp.json()
                # Cache all holidays for the year
                for h in holidays:
                    h_date = h.get("date")
                    if h_date:
                        _set_cached(f"holiday_{year}_{h_date}", (True, h.get("localName", "National Holiday")))
                
                # Check target date
                cached_target = _get_cached(cache_key)
                if cached_target is not None:
                    return cached_target
    except Exception:
        pass
        
    result = (False, None)
    _set_cached(cache_key, result)
    return result

async def calculate_tomtom_commute(origin: str, destination: str, api_key: str) -> Dict[str, Any]:
    if not api_key:
        return {"delay_minutes": 5.0, "total_duration_mins": 50.0}
    url = f"https://api.tomtom.com/routing/1/calculateRoute/{origin}:{destination}/json?key={api_key}"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                summary = resp.json().get("routes", [])[0].get("summary", {})
                return {
                    "delay_minutes": summary.get("trafficDelayInSeconds", 0) / 60.0,
                    "total_duration_mins": summary.get("travelTimeInSeconds", 3000) / 60.0
                }
    except Exception:
        pass
    return {"delay_minutes": 5.0, "total_duration_mins": 50.0}
