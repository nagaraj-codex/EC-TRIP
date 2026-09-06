import httpx
from typing import Dict, Any

WMO_CODE_MAP = {
    0: "sunny", 1: "sunny",
    2: "cloudy", 3: "cloudy", 45: "cloudy", 48: "cloudy",
    51: "light_rain", 53: "light_rain", 55: "light_rain",
    61: "light_rain", 63: "heavy_rain", 65: "heavy_rain",
    80: "light_rain", 81: "heavy_rain", 82: "heavy_rain",
    95: "heavy_rain"
}

async def fetch_weather(lat: float, lon: float, target_date: str) -> Dict[str, Any]:
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weathercode,temperature_2m_max,precipitation_sum&timezone=Asia/Kolkata"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                dates = data.get("daily", {}).get("time", [])
                if target_date in dates:
                    idx = dates.index(target_date)
                    code = data["daily"]["weathercode"][idx]
                    temp = data["daily"]["temperature_2m_max"][idx]
                    return {
                        "condition": WMO_CODE_MAP.get(code, "cloudy"),
                        "temp_max": float(temp)
                    }
    except Exception:
        pass
        
    return {"condition": "sunny", "temp_max": 32.0}
