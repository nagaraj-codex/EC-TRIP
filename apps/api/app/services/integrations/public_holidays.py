import httpx
from datetime import date
from typing import Tuple, Optional

# In-memory cache for holidays
_holiday_cache = {}

async def is_public_holiday(target_date: date) -> Tuple[bool, Optional[str]]:
    """
    Checks Nager.Date API for public holidays in India.
    Caches results in-memory.
    """
    year = target_date.year
    if year not in _holiday_cache:
        url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/IN"
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                _holiday_cache[year] = {item["date"]: item["name"] for item in data}
            except Exception:
                _holiday_cache[year] = {}
                
    date_str = target_date.strftime("%Y-%m-%d")
    holidays = _holiday_cache.get(year, {})
    
    if date_str in holidays:
        return True, holidays[date_str]
        
    return False, None
