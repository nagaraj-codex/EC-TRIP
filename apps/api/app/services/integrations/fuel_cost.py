import os
import httpx
from typing import Dict, Any

async def estimate_fuel_cost(roundtrip_km: float, mileage_kmpl: float = 15.0) -> Dict[str, Any]:
    """
    Compute roundtrip vehicle fuel expense: (roundtrip_km / mileage) * current_fuel_price
    Falls back to a static price if RAPIDAPI_FUEL_KEY is missing.
    """
    api_key = os.environ.get("RAPIDAPI_FUEL_KEY")
    static_fuel_price = 100.75 # Approx static INR/liter in Chennai 2026
    
    current_fuel_price = static_fuel_price
    is_fallback = True
    
    if api_key:
        # Placeholder for real RapidAPI fuel price endpoint
        # For this MVP we will use the static fallback if the call fails
        url = "https://fuel-prices-india.p.rapidapi.com/v1/chennai"
        headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": "fuel-prices-india.p.rapidapi.com"
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()
                current_fuel_price = data.get("petrol_price", static_fuel_price)
                is_fallback = False
            except Exception:
                pass

    expense = (roundtrip_km / mileage_kmpl) * current_fuel_price
    
    return {
        "fuel_expense_inr": round(expense, 2),
        "fuel_price_used": current_fuel_price,
        "is_fallback": is_fallback
    }
