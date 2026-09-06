from typing import Dict, Tuple

PRIORITY_WEIGHTS: Dict[str, Tuple[float, float, float]] = {
    "Cheapest": (0.15, 0.70, 0.15),
    "Least Crowded": (0.70, 0.15, 0.15),
    "Best Balanced": (0.34, 0.33, 0.33),
    "Maximum Rides": (0.60, 0.20, 0.20),
}

WEATHER_FIT_TABLE: Dict[str, float] = {
    "sunny": 1.0,
    "cloudy": 0.8,
    "light_rain": 0.4,
    "heavy_rain": 0.1
}

def calculate_visit_score(priority: str, time_saving: float, money_saving: float, weather_condition: str) -> float:
    weights = PRIORITY_WEIGHTS.get(priority, (0.34, 0.33, 0.33))
    w_time, w_money, w_weather = weights
    weather_fit = WEATHER_FIT_TABLE.get(weather_condition.lower(), 0.7)
    
    score = (w_time * time_saving) + (w_money * money_saving) + (w_weather * weather_fit)
    return round(score * 100.0, 1)
