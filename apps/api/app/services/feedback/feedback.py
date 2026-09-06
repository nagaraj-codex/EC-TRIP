import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional

# In-memory Observation Store: List of recorded observations
_OBSERVATIONS: List[Dict[str, Any]] = []

# Rate limiter: IP -> List of submission timestamps
_RATE_LIMITS: Dict[str, List[float]] = {}
MAX_REPORTS_PER_WINDOW = 5
WINDOW_SECONDS = 60.0
RETENTION_DAYS = 365

def check_rate_limit(client_ip: str) -> bool:
    """
    Sliding-window in-memory rate limiter.
    Allows at most MAX_REPORTS_PER_WINDOW per client IP in a 60-second window.
    """
    now = time.time()
    timestamps = _RATE_LIMITS.get(client_ip, [])
    # Filter timestamps within active window
    active_timestamps = [t for t in timestamps if now - t < WINDOW_SECONDS]
    
    if len(active_timestamps) >= MAX_REPORTS_PER_WINDOW:
        _RATE_LIMITS[client_ip] = active_timestamps
        return False
        
    active_timestamps.append(now)
    _RATE_LIMITS[client_ip] = active_timestamps
    return True

def record_observation(
    park_id: str,
    visit_date: str,
    observed_crowd: str,
    observed_wait_top_ride_minutes: int,
    fasttrack_purchased: bool = False,
    verified_on_site: bool = False,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None
) -> Dict[str, Any]:
    """
    Records an observation into active memory and enforces 1-year retention.
    """
    purge_expired_observations()
    
    entry = {
        "park_id": park_id,
        "visit_date": visit_date,
        "observed_crowd": observed_crowd,
        "observed_wait_top_ride_minutes": observed_wait_top_ride_minutes,
        "fasttrack_purchased": fasttrack_purchased,
        "verified_on_site": verified_on_site,
        "user_lat": user_lat,
        "user_lon": user_lon,
        "created_at": datetime.now(timezone.utc)
    }
    _OBSERVATIONS.append(entry)
    return entry

def get_recent_observations(park_id: str, visit_date: str) -> List[Dict[str, Any]]:
    """
    Retrieves verified observations for a given park and date.
    """
    return [
        obs for obs in _OBSERVATIONS
        if obs["park_id"] == park_id and obs["visit_date"] == visit_date
    ]

def purge_expired_observations(max_age_days: int = RETENTION_DAYS):
    """
    1-Year Retention Clock: Automatically purges observations older than 365 days.
    """
    global _OBSERVATIONS
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    _OBSERVATIONS = [
        obs for obs in _OBSERVATIONS
        if obs.get("created_at", datetime.now(timezone.utc)) >= cutoff
    ]
