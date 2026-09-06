import os
import httpx
from typing import Dict, Any

async def get_traffic_commute(origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float) -> Dict[str, Any]:
    """
    TomTom Routing API to calculate travel time and traffic delay.
    Falls back to static baseline estimates if TOMTOM_API_KEY is unset.
    """
    api_key = os.environ.get("TOMTOM_API_KEY")
    if not api_key:
        return {
            "travel_time_minutes": 60, # Static baseline
            "traffic_delay_minutes": 0,
            "is_fallback": True
        }
        
    url = f"https://api.tomtom.com/routing/1/calculateRoute/{origin_lat},{origin_lon}:{dest_lat},{dest_lon}/json?key={api_key}"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            route = data.get("routes", [{}])[0].get("summary", {})
            travel_time = route.get("travelTimeInSeconds", 3600) // 60
            delay = route.get("trafficDelayInSeconds", 0) // 60
            
            return {
                "travel_time_minutes": travel_time,
                "traffic_delay_minutes": delay,
                "is_fallback": False
            }
        except Exception:
            return {
                "travel_time_minutes": 60,
                "traffic_delay_minutes": 0,
                "is_fallback": True
            }
