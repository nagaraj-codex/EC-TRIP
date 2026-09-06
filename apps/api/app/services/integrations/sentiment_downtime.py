import os
import httpx
from typing import Dict, Any

async def check_sentiment_downtime(place_id: str) -> Dict[str, bool]:
    """
    Google Places API / Reviews parser.
    Parses recent reviews for keywords: "maintenance", "closed", "breakdown", "rain stopped".
    Returns boolean flags for ride operational disruptions.
    """
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    flags = {
        "has_maintenance_mentions": False,
        "has_closure_mentions": False,
        "has_breakdown_mentions": False,
        "has_weather_stoppage_mentions": False
    }
    
    if not api_key:
        return flags
        
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews&key={api_key}"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            reviews = data.get("result", {}).get("reviews", [])
            
            for review in reviews:
                text = review.get("text", "").lower()
                if "maintenance" in text:
                    flags["has_maintenance_mentions"] = True
                if "closed" in text:
                    flags["has_closure_mentions"] = True
                if "breakdown" in text:
                    flags["has_breakdown_mentions"] = True
                if "rain stopped" in text or "weather stopped" in text:
                    flags["has_weather_stoppage_mentions"] = True
                    
        except Exception:
            pass
            
    return flags
