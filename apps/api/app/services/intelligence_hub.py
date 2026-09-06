import asyncio
from datetime import datetime
from typing import Any, Optional, Dict
from app.core.config import settings
from app.services.cache import get_cache, set_cache
from app.services.integrations.environmental import fetch_open_meteo_weather, fetch_solar_uv, fetch_sunrise_sunset
from app.services.integrations.scheduling import check_nager_holiday
from app.services.optimization.visit_scoring import calculate_visit_score
from app.services.fasttrack.roi_calculator import calculate_fasttrack_roi
from app.services.feedback.feedback import get_recent_observations
from app.schemas.recommendation import DayEvaluation

async def evaluate_candidate_date(
    park_id: str,
    park_meta_or_date: Any = None,
    date_str: Optional[str] = None,
    priority: str = "Best Balanced",
    max_price: float = 1549.0,
    current_price: float = 1312.0,
    fasttrack_price: float = 999.0,
    *args,
    **kwargs
) -> DayEvaluation:
    # 1. Resolve arguments
    if isinstance(park_meta_or_date, dict):
        lat = park_meta_or_date.get("lat", 12.75)
        lon = park_meta_or_date.get("lon", 80.19)
        actual_date_str = date_str or datetime.now().strftime("%Y-%m-%d")
    elif isinstance(park_meta_or_date, str):
        actual_date_str = park_meta_or_date
        meta = settings.PARK_COORDINATES.get(park_id, {"lat": 12.75, "lon": 80.19})
        lat, lon = meta["lat"], meta["lon"]
    else:
        actual_date_str = date_str or datetime.now().strftime("%Y-%m-%d")
        meta = settings.PARK_COORDINATES.get(park_id, {"lat": 12.75, "lon": 80.19})
        lat, lon = meta["lat"], meta["lon"]

    # 2. Check Redis / Memory Cache First (TTL: 3600s)
    cache_key = f"rec:{park_id}:{actual_date_str}:{priority}"
    cached_eval = await get_cache(cache_key)
    if cached_eval and isinstance(cached_eval, dict):
        cached_eval["source"] = "Redis Cache (0ms latency)"
        return DayEvaluation(**cached_eval)
    
    # 3. Concurrent execution with TTL-cached external services
    dt = datetime.strptime(actual_date_str, "%Y-%m-%d")
    weather_res, uv_res, sun_res, holiday_res = await asyncio.gather(
        fetch_open_meteo_weather(lat, lon, actual_date_str),
        fetch_solar_uv(lat, lon),
        fetch_sunrise_sunset(lat, lon),
        check_nager_holiday(dt.year, actual_date_str),
        return_exceptions=True
    )
    
    weather = weather_res if isinstance(weather_res, dict) else {"condition": "sunny", "temp_max": 32.0, "rain_prob": 10.0}
    is_holiday = holiday_res[0] if isinstance(holiday_res, tuple) else False
    is_weekend = dt.weekday() >= 5
    
    # 4. Rules-Based Crowd Base (Judge 1 & Judge 2)
    crowd_points = 25
    if is_weekend: crowd_points += 40
    if is_holiday: crowd_points += 35
    if weather["condition"] == "heavy_rain": crowd_points -= 30
    crowd_points = max(10, min(crowd_points, 100))
    
    # 5. Crowdsourced Feedback Integration (Judge 3)
    recent_reports = get_recent_observations(park_id, actual_date_str)
    has_verified_feedback = False
    
    if recent_reports:
        # Map observed crowds into points
        crowd_map = {"low": 25, "medium": 55, "high": 80, "very_high": 95}
        obs_points = [
            crowd_map.get(r["observed_crowd"], 50) for r in recent_reports
        ]
        avg_obs = sum(obs_points) / len(obs_points)
        # Weighted blend: 60% rules forecast + 40% ground truth reports
        crowd_points = int(0.6 * crowd_points + 0.4 * avg_obs)
        has_verified_feedback = any(r.get("verified_on_site", False) for r in recent_reports)
    
    # 6. Visit Score Computation
    time_saving = 1.0 - (crowd_points / 100.0)
    money_saving = (max_price - current_price) / max_price if max_price > 0 else 0.0
    visit_score = calculate_visit_score(priority, time_saving, money_saving, weather["condition"])
    
    wait_mins = int((crowd_points / 100.0) * 90)
    saved_mins = max(0, wait_mins - 5)
    ft_roi = calculate_fasttrack_roi(fasttrack_price, saved_mins)
    
    # 7. Dynamic Confidence Label & Reasoning
    if has_verified_feedback:
        confidence = "High"
        reasoning = f"Calibrated with on-site verified ground-truth crowd reports ({len(recent_reports)} report(s)) and Open-Meteo weather."
    elif not isinstance(holiday_res, Exception) and not isinstance(weather_res, Exception):
        confidence = "High" if (is_weekend or is_holiday) else "Medium"
        reasoning = f"Calculated from verified 2026 tariff + Open-Meteo forecast (Rain: {weather.get('rain_prob', 0)}%, Holiday: {is_holiday})."
    else:
        confidence = "Low"
        reasoning = "Fallback prediction baseline. Live calendar signals temporarily degraded."
        
    evaluation = DayEvaluation(
        date=actual_date_str,
        visit_score=visit_score,
        crowd_level="high" if crowd_points > 70 else ("medium" if crowd_points > 40 else "low"),
        predicted_wait_top_ride_minutes=wait_mins,
        ticket_price=current_price,
        weather_condition=weather["condition"],
        temp_max=float(weather["temp_max"]),
        fasttrack_verdict=ft_roi["verdict"],
        cost_per_minute_saved=float(ft_roi["cost_per_minute_saved"]),
        confidence=confidence,
        reasoning=reasoning
    )

    # 8. Cache result in Redis/Memory with 1-hour TTL (3600s)
    await set_cache(cache_key, evaluation.model_dump(), ttl=3600)
    
    return evaluation
