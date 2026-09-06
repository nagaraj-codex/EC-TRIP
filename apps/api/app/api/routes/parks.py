import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/parks", tags=["Parks Database"])

_CATALOG_CACHE: Optional[Dict[str, Any]] = None

def get_db_path() -> Path:
    # Resolve relative to current file or working directory
    base_dir = Path(__file__).resolve().parents[4]  # repo root
    catalog_path = base_dir / "data" / "parks_database" / "unified_parks_catalog.json"
    if catalog_path.exists():
        return catalog_path
    
    # Fallback to local cwd
    local_path = Path.cwd() / "data" / "parks_database" / "unified_parks_catalog.json"
    return local_path

def load_catalog(force_reload: bool = False) -> Dict[str, Any]:
    global _CATALOG_CACHE
    if _CATALOG_CACHE is not None and not force_reload:
        return _CATALOG_CACHE

    path = get_db_path()
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                _CATALOG_CACHE = json.load(f)
                return _CATALOG_CACHE
        except Exception:
            return {"parks": {}}
    return {"parks": {}}

def calculate_total_rides(pdata: Dict[str, Any]) -> int:
    if "attractions_and_rides" in pdata and isinstance(pdata["attractions_and_rides"], list):
        return len(pdata["attractions_and_rides"])
    
    rides_cat = pdata.get("rides_catalog")
    if isinstance(rides_cat, dict):
        adult_rides = rides_cat.get("adult_and_thrill_rides", [])
        family_rides = rides_cat.get("family_and_scenic_rides", [])
        return len(adult_rides) + len(family_rides)
    
    breakdown = pdata.get("rides_and_attractions_breakdown")
    if isinstance(breakdown, dict):
        water = breakdown.get("water_rides", [])
        dry = breakdown.get("dry_and_thrill_rides", [])
        return len(water) + len(dry)
        
    return 0

@router.get("")
async def get_all_parks():
    """Retrieve full catalog summary of all theme parks."""
    catalog = load_catalog()
    parks = catalog.get("parks", {})
    summary: List[Dict[str, Any]] = []
    
    for pid, pdata in parks.items():
        summary.append({
            "park_id": pid,
            "name": pdata.get("name"),
            "brand": pdata.get("brand"),
            "city": pdata.get("location", {}).get("city"),
            "official_website": pdata.get("official_website"),
            "coordinates": pdata.get("location", {}).get("coordinates"),
            "operating_hours": pdata.get("operating_hours"),
            "total_rides": calculate_total_rides(pdata)
        })
    return {"status": "success", "count": len(summary), "data": summary}

@router.get("/{park_id}")
async def get_park_details(park_id: str):
    """Retrieve exhaustive database details for a specific park."""
    catalog = load_catalog()
    parks = catalog.get("parks", {})
    if park_id not in parks:
        raise HTTPException(status_code=404, detail=f"Park '{park_id}' not found in ground-truth database.")
    return {"status": "success", "data": parks[park_id]}

@router.get("/{park_id}/rides")
async def get_park_rides(park_id: str):
    """Retrieve all rides and attractions for a park."""
    catalog = load_catalog()
    parks = catalog.get("parks", {})
    if park_id not in parks:
        raise HTTPException(status_code=404, detail=f"Park '{park_id}' not found.")
    park = parks[park_id]
    rides = park.get("attractions_and_rides") or park.get("rides_catalog") or park.get("rides_and_attractions_breakdown")
    return {"status": "success", "park_id": park_id, "rides": rides}

@router.get("/{park_id}/tariff")
async def get_park_tariff(park_id: str):
    """Retrieve ticket rates, packages, and discounts."""
    catalog = load_catalog()
    parks = catalog.get("parks", {})
    if park_id not in parks:
        raise HTTPException(status_code=404, detail=f"Park '{park_id}' not found.")
    park = parks[park_id]
    return {
        "status": "success",
        "park_id": park_id,
        "pricing": park.get("ticket_pricing"),
        "dress_code": park.get("dress_code_policy")
    }
