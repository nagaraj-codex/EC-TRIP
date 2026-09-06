import httpx
from datetime import date
from typing import Dict, Any, List

async def get_weather_forecast(lat: float, lon: float) -> List[Dict[str, Any]]:
    """
    Fetch daily forecast from Open-Meteo and map WMO codes.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weathercode,temperature_2m_max,precipitation_sum,precipitation_probability_max&timezone=auto"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
        except Exception:
            return []
            
    daily = data.get("daily", {})
    weathercodes = daily.get("weathercode", [])
    
    def map_wmo(code: int) -> str:
        if 0 <= code <= 1:
            return "sunny"
        elif 2 <= code <= 3:
            return "cloudy"
        elif 51 <= code <= 65:
            return "light_rain"
        elif 66 <= code <= 99:
            return "heavy_rain"
        return "sunny"
        
    forecast = []
    times = daily.get("time", [])
    for i in range(len(times)):
        forecast.append({
            "date": times[i],
            "weather_condition": map_wmo(weathercodes[i]) if i < len(weathercodes) else "sunny",
            "temperature_2m_max": daily.get("temperature_2m_max", [])[i],
            "precipitation_sum": daily.get("precipitation_sum", [])[i],
            "precipitation_probability_max": daily.get("precipitation_probability_max", [])[i]
        })
        
    return forecast
