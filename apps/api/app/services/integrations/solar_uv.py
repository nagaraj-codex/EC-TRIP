import httpx
from typing import Dict, Any, List

async def fetch_solar_data(lat: float, lon: float) -> Dict[str, Any]:
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&hourly=uv_index,direct_normal_irradiance&timezone=auto"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception:
            return {}

def get_uv_recommendation(hourly_uv: List[float], hourly_times: List[str]) -> Dict[str, Any]:
    """
    Returns peak burn window and suggests indoor/water rides.
    """
    if not hourly_uv:
        return {"peak_window": None, "recommendation": "Data unavailable."}
        
    peak_uv = max(hourly_uv)
    peak_indices = [i for i, uv in enumerate(hourly_uv) if uv == peak_uv and uv > 5.0]
    
    if not peak_indices:
        return {"peak_window": None, "recommendation": "UV levels are safe. Enjoy all rides!"}
        
    start_time = hourly_times[peak_indices[0]]
    end_time = hourly_times[peak_indices[-1]]
    
    return {
        "peak_window": f"{start_time} - {end_time}",
        "peak_uv_index": peak_uv,
        "recommendation": "High UV index detected. We suggest scheduling indoor attractions, shaded areas, or water rides during this peak burn window."
    }
