import os
import json
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel, Field

def _load_catalog_pricing_and_coords():
    base_dir = Path(__file__).resolve().parents[4]
    catalog_path = base_dir / "data" / "parks_database" / "unified_parks_catalog.json"
    if not catalog_path.exists():
        catalog_path = Path.cwd() / "data" / "parks_database" / "unified_parks_catalog.json"
        
    coords: Dict[str, Dict[str, Any]] = {
        "wonderla-chennai": {"lat": 12.75, "lon": 80.19, "city": "Chennai", "name": "Wonderla Chennai"},
        "mgm-dizzee-chennai": {"lat": 12.82, "lon": 80.24, "city": "Chennai", "name": "MGM Dizzee World"},
        "black-thunder-coimbatore": {"lat": 11.30, "lon": 76.93, "city": "Coimbatore", "name": "Black Thunder"}
    }
    
    pricing: Dict[str, Dict[str, float]] = {
        "wonderla-chennai": {"weekday": 1312.0, "weekend": 1549.0, "fasttrack": 999.0},
        "mgm-dizzee-chennai": {"weekday": 699.0, "weekend": 849.0, "fasttrack": 400.0},
        "black-thunder-coimbatore": {"weekday": 1090.0, "weekend": 1090.0, "fasttrack": 500.0}
    }
    
    if catalog_path.exists():
        try:
            with open(catalog_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                parks = data.get("parks", {})
                for pid, pdata in parks.items():
                    # Extract coordinates
                    loc = pdata.get("location", {})
                    c = loc.get("coordinates", {})
                    if "lat" in c and "lon" in c:
                        coords[pid] = {
                            "lat": float(c["lat"]),
                            "lon": float(c["lon"]),
                            "city": loc.get("city", "Tamil Nadu"),
                            "name": pdata.get("name", pid)
                        }
                    # Extract pricing
                    tp = pdata.get("ticket_pricing", {})
                    reg = tp.get("regular_rates", {})
                    ft = tp.get("fastrack_pass", {})
                    
                    ft_price = 999.0
                    if pid == "mgm-dizzee-chennai": ft_price = 400.0
                    elif pid == "black-thunder-coimbatore": ft_price = 500.0
                    
                    pricing[pid] = {
                        "weekday": float(reg.get("adult_weekday", 1312.0)),
                        "weekend": float(reg.get("adult_weekend", 1549.0)),
                        "fasttrack": float(ft.get("price", ft_price))
                    }
        except Exception:
            pass
            
    return coords, pricing

_coords, _pricing = _load_catalog_pricing_and_coords()

class AppSettings(BaseModel):
    PROJECT_NAME: str = "QueueCut Intelligence API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])

    # Single source of truth loaded from unified_parks_catalog.json
    PARK_COORDINATES: Dict[str, Dict[str, Any]] = Field(default_factory=lambda: _coords)
    PARK_PRICING: Dict[str, Dict[str, float]] = Field(default_factory=lambda: _pricing)

    # API Endpoints & Keys
    OPEN_METEO_FORECAST_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_AIR_QUALITY_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    SUNRISE_SUNSET_API_URL: str = "https://api.sunrise-sunset.org/json"
    MET_NORWAY_URL: str = "https://api.met.no/weatherapi/locationforecast/2.0/compact"

    OLA_MAPS_API_KEY: str = Field(default_factory=lambda: os.getenv("OLA_MAPS_API_KEY", ""))
    MAPPLS_API_KEY: str = Field(default_factory=lambda: os.getenv("MAPPLS_API_KEY", ""))
    MAPBOX_ACCESS_TOKEN: str = Field(default_factory=lambda: os.getenv("MAPBOX_ACCESS_TOKEN", ""))
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"
    BIGDATACLOUD_GEO_URL: str = "https://api.bigdatacloud.net/data/reverse-geocode-client"
    LOCATIONIQ_API_KEY: str = Field(default_factory=lambda: os.getenv("LOCATIONIQ_API_KEY", ""))
    GEOAPIFY_API_KEY: str = Field(default_factory=lambda: os.getenv("GEOAPIFY_API_KEY", ""))
    OSRM_DEMO_URL: str = "https://router.project-osrm.org/route/v1/driving/"

    NAGER_DATE_API_URL: str = "https://date.nager.at/api/v3/PublicHolidays"
    TOMTOM_API_KEY: str = Field(default_factory=lambda: os.getenv("TOMTOM_API_KEY", ""))
    RAPIDAPI_FUEL_KEY: str = Field(default_factory=lambda: os.getenv("RAPIDAPI_FUEL_KEY", ""))

    GEMINI_API_KEY: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    HUGGINGFACE_API_TOKEN: str = Field(default_factory=lambda: os.getenv("HUGGINGFACE_API_TOKEN", ""))

    RECAPTCHA_SECRET_KEY: str = Field(default_factory=lambda: os.getenv("RECAPTCHA_SECRET_KEY", ""))
    CLOUDFLARE_TURNSTILE_SECRET: str = Field(default_factory=lambda: os.getenv("CLOUDFLARE_TURNSTILE_SECRET", ""))

    SUPABASE_URL: str = Field(default_factory=lambda: os.getenv("SUPABASE_URL", ""))
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default_factory=lambda: os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""))

    RESEND_API_KEY: str = Field(default_factory=lambda: os.getenv("RESEND_API_KEY", ""))
    BREVO_API_KEY: str = Field(default_factory=lambda: os.getenv("BREVO_API_KEY", ""))
    TELEGRAM_BOT_TOKEN: str = Field(default_factory=lambda: os.getenv("TELEGRAM_BOT_TOKEN", ""))
    DISCORD_WEBHOOK_URL: str = Field(default_factory=lambda: os.getenv("DISCORD_WEBHOOK_URL", ""))

    GITHUB_TOKEN: str = Field(default_factory=lambda: os.getenv("GITHUB_TOKEN", ""))
    GITHUB_REPO_OWNER: str = Field(default_factory=lambda: os.getenv("GITHUB_REPO_OWNER", ""))
    GITHUB_REPO_NAME: str = Field(default_factory=lambda: os.getenv("GITHUB_REPO_NAME", ""))
    THEMEPARKS_WIKI_URL: str = "https://api.themeparks.wiki/v1/"

settings = AppSettings()
