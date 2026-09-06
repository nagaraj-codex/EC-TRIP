import os
import httpx
from datetime import date
from typing import Dict, Any

async def get_event_surge(lat: float, lon: float, target_date: date) -> Dict[str, Any]:
    """
    PredictHQ Events API to fetch concerts, sports, etc within 30km radius.
    Returns crowd_surge_modifier (+/- % impact).
    Falls back to 0.0 if PREDICTHQ_API_TOKEN is missing.
    """
    api_token = os.environ.get("PREDICTHQ_API_TOKEN")
    if not api_token:
        return {"crowd_surge_modifier": 0.0, "is_fallback": True}
        
    date_str = target_date.strftime("%Y-%m-%d")
    url = f"https://api.predicthq.com/v1/events/?location_around.origin={lat},{lon}&location_around.scale=30km&start.gte={date_str}&start.lte={date_str}"
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Accept": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            events = data.get("results", [])
            
            # Simple heuristic: +5% surge for every significant event, capped at +30%
            surge = min(len(events) * 0.05, 0.30)
            return {"crowd_surge_modifier": surge, "is_fallback": False}
        except Exception:
            return {"crowd_surge_modifier": 0.0, "is_fallback": True}
