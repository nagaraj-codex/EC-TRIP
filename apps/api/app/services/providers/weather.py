from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Protocol

import httpx

from app.core.config import settings


@dataclass(frozen=True)
class ProviderResult:
    data: dict[str, Any]
    status: str
    source: str
    error: str | None = None


class WeatherProvider(Protocol):
    async def forecast(
        self, latitude: float, longitude: float, target_date: str
    ) -> ProviderResult:
        """Return weather data with explicit freshness and availability metadata."""


class OpenMeteoProvider:
    def __init__(self, timeout_seconds: float = 4.0) -> None:
        self.timeout_seconds = timeout_seconds

    async def forecast(
        self, latitude: float, longitude: float, target_date: str
    ) -> ProviderResult:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "weathercode,temperature_2m_max,precipitation_probability_max",
            "timezone": "Asia/Kolkata",
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.get(
                    settings.OPEN_METEO_FORECAST_URL, params=params
                )
                response.raise_for_status()
                payload = response.json()
            dates = payload.get("daily", {}).get("time", [])
            if target_date not in dates:
                return ProviderResult(
                    {}, "UNAVAILABLE", "Open-Meteo", "Forecast date unavailable"
                )
            index = dates.index(target_date)
            daily = payload["daily"]
            return ProviderResult(
                {
                    "condition": _condition_for_code(daily["weathercode"][index]),
                    "temp_max": daily["temperature_2m_max"][index],
                    "rain_prob": daily["precipitation_probability_max"][index],
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                },
                "FRESH",
                "Open-Meteo",
            )
        except (httpx.HTTPError, ValueError, KeyError, IndexError) as exc:
            return ProviderResult({}, "UNAVAILABLE", "Open-Meteo", str(exc))


def _condition_for_code(code: int) -> str:
    if code in {0, 1}:
        return "sunny"
    if code in {2, 3, 45, 48}:
        return "cloudy"
    if code in {51, 53, 55, 61, 80}:
        return "light_rain"
    if code in {63, 65, 81, 82, 95}:
        return "heavy_rain"
    return "unavailable"


weather_provider = OpenMeteoProvider()
