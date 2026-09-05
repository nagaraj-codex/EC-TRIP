import httpx
import json
from pathlib import Path
from datetime import datetime

# Open-Meteo variables (Latitude and Longitude for Wonderla Chennai)
# Approx coord: 12.8315, 79.9705
LATITUDE = 12.8315
LONGITUDE = 79.9705

async def fetch_weather_now() -> dict:
    """
    Fetches the latest live weather from Open-Meteo API.
    To be refreshed every few hours by the cron job to prevent intraday staleness.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current_weather=true"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        
    return data.get("current_weather", {})

def update_weather_cache(data: dict, cache_dir: str = "../../../../../data/interim/cleaned_weather_cache"):
    """
    Updates the lightweight weather-now.json cache.
    """
    path = Path(cache_dir)
    path.mkdir(parents=True, exist_ok=True)
    
    cache_file = path / "weather-now.json"
    with open(cache_file, "w") as f:
        json.dump({
            "updated_at": datetime.utcnow().isoformat(),
            "weather": data
        }, f, indent=2)
