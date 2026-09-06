import time
import httpx
from typing import Dict, Any, Tuple

WMO_CODE_MAP = {
    0: "sunny", 1: "sunny", 2: "cloudy", 3: "cloudy",
    51: "light_rain", 61: "light_rain", 63: "heavy_rain", 95: "heavy_rain"
}

# In-memory TTL cache: key -> (timestamp, data)
_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 3600.0  # 1 Hour TTL

def _get_cached(key: str) -> Any:
    if key in _CACHE:
        ts, data = _CACHE[key]
        if time.time() - ts < CACHE_TTL_SECONDS:
            return data
    return None

def _set_cached(key: str, data: Any):
    _CACHE[key] = (time.time(), data)

async def fetch_open_meteo_weather(lat: float, lon: float, target_date: str) -> Dict[str, Any]:
    cache_key = f"weather_{round(lat, 2)}_{round(lon, 2)}_{target_date}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weathercode,temperature_2m_max,precipitation_probability_max&timezone=Asia/Kolkata"
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
                    rain_prob = data["daily"]["precipitation_probability_max"][idx]
                    result = {"condition": WMO_CODE_MAP.get(code, "sunny"), "temp_max": temp, "rain_prob": rain_prob}
                    _set_cached(cache_key, result)
                    return result
    except Exception:
        pass
        
    fallback = {"condition": "sunny", "temp_max": 32.0, "rain_prob": 10.0}
    _set_cached(cache_key, fallback)
    return fallback

async def fetch_solar_uv(lat: float, lon: float) -> Dict[str, Any]:
    cache_key = f"uv_{round(lat, 2)}_{round(lon, 2)}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&hourly=uv_index"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                uvs = resp.json().get("hourly", {}).get("uv_index", [5.0]*24)
                peak_uv = max(uvs) if uvs else 6.0
                result = {
                    "peak_uv": peak_uv,
                    "advisory": "High UV midday, shift to water/indoor rides between 11:30 AM and 2:30 PM" if peak_uv > 6 else "Moderate UV"
                }
                _set_cached(cache_key, result)
                return result
    except Exception:
        pass
        
    fallback = {"peak_uv": 7.0, "advisory": "Standard UV advisory"}
    _set_cached(cache_key, fallback)
    return fallback

async def fetch_sunrise_sunset(lat: float, lon: float) -> Dict[str, str]:
    cache_key = f"sun_{round(lat, 2)}_{round(lon, 2)}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&formatted=0"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                results = resp.json().get("results", {})
                result = {
                    "sunset": results.get("sunset", "18:00:00"),
                    "twilight_end": results.get("civil_twilight_end", "18:30:00")
                }
                _set_cached(cache_key, result)
                return result
    except Exception:
        pass
        
    fallback = {"sunset": "18:15:00", "twilight_end": "18:45:00"}
    _set_cached(cache_key, fallback)
    return fallback

async def fetch_met_norway(lat: float, lon: float) -> Dict[str, Any]:
    cache_key = f"metnorway_{round(lat, 2)}_{round(lon, 2)}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    headers = {"User-Agent": "QueueCutApp/2.0 contact@queuecut.com"}
    url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={lat}&lon={lon}"
    try:
        async with httpx.AsyncClient(timeout=4.0, headers=headers) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                timeseries = resp.json().get("properties", {}).get("timeseries", [])
                if timeseries:
                    details = timeseries[0].get("data", {}).get("instant", {}).get("details", {})
                    result = {
                        "air_temperature": details.get("air_temperature", 30.0),
                        "wind_speed": details.get("wind_speed", 2.0)
                    }
                    _set_cached(cache_key, result)
                    return result
    except Exception:
        pass
        
    fallback = {"air_temperature": 31.0, "wind_speed": 3.0}
    _set_cached(cache_key, fallback)
    return fallback
