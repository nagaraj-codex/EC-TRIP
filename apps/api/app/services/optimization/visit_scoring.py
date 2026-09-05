def calculate_visit_score(
    time_saving: float,
    money_saving: float,
    weather_fit: float,
    priority_mode: str = "balanced"
) -> float:
    """
    Core mathematical formula evaluating the visit quality based on dynamic weights.
    Score = (w_time * TimeSaving) + (w_money * MoneySaving) + (w_weather * WeatherFit)
    """
    
    weights = {
        "cheapest": {"w_time": 0.2, "w_money": 0.6, "w_weather": 0.2},
        "least_crowded": {"w_time": 0.7, "w_money": 0.1, "w_weather": 0.2},
        "balanced": {"w_time": 0.35, "w_money": 0.35, "w_weather": 0.3},
        "maximum_rides": {"w_time": 0.6, "w_money": 0.2, "w_weather": 0.2},
    }

    w = weights.get(priority_mode, weights["balanced"])

    score = (w["w_time"] * time_saving) + (w["w_money"] * money_saving) + (w["w_weather"] * weather_fit)
    return round(score, 2)
