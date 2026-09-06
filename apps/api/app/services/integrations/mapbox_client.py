import os
import httpx
from typing import Dict, Any

async def get_drive_time_polygon(lon: float, lat: float, minutes: int = 45) -> Dict[str, Any]:
    api_key = os.environ.get("MAPBOX_ACCESS_TOKEN")
    if not api_key:
        return {"type": "FeatureCollection", "features": []}
    
    url = f"https://api.mapbox.com/isochrone/v1/mapbox/driving/{lon},{lat}?contours_minutes={minutes}&polygons=true&access_token={api_key}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception:
            return {"type": "FeatureCollection", "features": []}
