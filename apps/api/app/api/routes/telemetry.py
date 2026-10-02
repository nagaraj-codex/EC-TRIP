from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from app.core.config import settings
from app.services.integrations.environmental import fetch_solar_uv, fetch_sunrise_sunset
from app.services.providers.weather import weather_provider
from app.services.integrations.geospatial import fetch_osrm_route
from datetime import datetime

router = APIRouter(prefix="/telemetry", tags=["Live Telemetry & Sensors"])


@router.get("/weather")
async def get_live_weather(
    park_id: Optional[str] = Query(None, description="Park identifier"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    date: Optional[str] = Query(None, description="Target date (YYYY-MM-DD)"),
):
    """
    Fetch consolidated live weather, solar UV index, and sunrise/sunset telemetry.
    """
    if park_id and park_id in settings.PARK_COORDINATES:
        park = settings.PARK_COORDINATES[park_id]
        target_lat = park["lat"]
        target_lon = park["lon"]
        park_name = park["name"]
    elif lat is not None and lon is not None:
        target_lat = lat
        target_lon = lon
        park_name = "Custom Location"
    else:
        # Default to Wonderla Chennai
        park = settings.PARK_COORDINATES.get(
            "wonderla-chennai", {"lat": 12.75, "lon": 80.19, "name": "Wonderla Chennai"}
        )
        target_lat = park["lat"]
        target_lon = park["lon"]
        park_name = park["name"]

    target_date = date or datetime.now().strftime("%Y-%m-%d")

    weather_result = await weather_provider.forecast(
        target_lat, target_lon, target_date
    )
    weather = {
        **weather_result.data,
        "data_status": weather_result.status,
        "source": weather_result.source,
    }
    if weather_result.error:
        weather["error"] = weather_result.error
    uv_data = await fetch_solar_uv(target_lat, target_lon)
    sun_data = await fetch_sunrise_sunset(target_lat, target_lon)

    return {
        "status": "success",
        "park_name": park_name,
        "date": target_date,
        "coordinates": {"lat": target_lat, "lon": target_lon},
        "weather": weather,
        "solar_uv": uv_data,
        "daylight": sun_data,
    }


@router.get("/commute")
async def calculate_commute_and_fuel(
    park_id: str = Query("wonderla-chennai", description="Target park ID"),
    origin_city: str = Query("Chennai", description="Origin city name"),
    origin_lat: float = Query(13.0827, description="Origin latitude"),
    origin_lon: float = Query(80.2707, description="Origin longitude"),
):
    """
    Computes driving distance, travel duration, and estimated petrol fuel cost.
    """
    if park_id not in settings.PARK_COORDINATES:
        raise HTTPException(status_code=404, detail=f"Park '{park_id}' not found.")

    dest = settings.PARK_COORDINATES[park_id]
    route_info = await fetch_osrm_route(
        origin_lat, origin_lon, dest["lat"], dest["lon"]
    )

    distance_km = route_info.get("distance_km", 38.5)
    duration_mins = route_info.get("duration_minutes", 65.0)

    # Fuel calculation: Petrol @ ₹101/Liter, 15 km/L baseline mileage
    petrol_rate = 101.0
    mileage_km_per_l = 15.0
    estimated_fuel_cost = round((distance_km / mileage_km_per_l) * petrol_rate, 2)

    return {
        "status": "success",
        "origin": origin_city,
        "destination": dest["name"],
        "distance_km": distance_km,
        "duration_minutes": duration_mins,
        "estimated_fuel_cost_inr": estimated_fuel_cost,
        "assumptions": {
            "fuel_type": "Petrol",
            "fuel_price_per_liter": petrol_rate,
            "vehicle_mileage_kmpl": mileage_km_per_l,
        },
    }
