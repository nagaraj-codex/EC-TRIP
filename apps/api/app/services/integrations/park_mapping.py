import httpx
from typing import Dict, Any, List

async def fetch_park_features(bbox: str) -> List[Dict[str, Any]]:
    """
    Fetches park attractions via OpenStreetMap Overpass API using a bounding box.
    bbox format: "min_lat,min_lon,max_lat,max_lon"
    """
    # Overpass QL query targeting attractions, coasters, water slides, and restaurants
    query = f"""
    [out:json][timeout:5];
    (
      node["tourism"="attraction"]({bbox});
      way["tourism"="attraction"]({bbox});
      node["roller_coaster"]({bbox});
      way["roller_coaster"]({bbox});
      node["water_slide"]({bbox});
      way["water_slide"]({bbox});
      node["amenity"="restaurant"]({bbox});
    );
    out body;
    """
    
    url = "https://overpass-api.de/api/interpreter"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.post(url, data={"data": query})
            response.raise_for_status()
            data = response.json()
            return data.get("elements", [])
        except Exception:
            return []
