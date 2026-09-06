import httpx
from datetime import date
from typing import Dict, Any

async def get_daylight_window(lat: float, lon: float, target_date: date) -> Dict[str, Any]:
    """
    Fetch civil twilight and sunset times from api.sunrise-sunset.org.
    """
    date_str = target_date.strftime("%Y-%m-%d")
    url = f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&date={date_str}&formatted=0"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json().get("results", {})
            return {
                "sunrise": data.get("sunrise"),
                "sunset": data.get("sunset"),
                "civil_twilight_begin": data.get("civil_twilight_begin"),
                "civil_twilight_end": data.get("civil_twilight_end"),
                "day_length_seconds": data.get("day_length")
            }
        except Exception:
            return {}
