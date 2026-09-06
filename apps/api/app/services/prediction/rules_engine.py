from datetime import datetime
from typing import Dict, Any, Optional

def predict_crowd_rules(
    park_id: str = "wonderla-chennai",
    target_date_str: Optional[str] = None,
    weather_condition: str = "sunny",
    is_holiday: bool = False,
    is_weekend: Optional[bool] = None,
    is_school_vacation: bool = False
) -> Dict[str, Any]:
    if target_date_str:
        try:
            date_obj = datetime.strptime(target_date_str, "%Y-%m-%d")
            weekend_flag = date_obj.weekday() >= 5
        except Exception:
            weekend_flag = bool(is_weekend)
    else:
        weekend_flag = bool(is_weekend)
    
    crowd_points = 20  # Base weekday crowd
    reasons = []
    
    if weekend_flag:
        crowd_points += 45
        reasons.append("weekend visitor surge")
    else:
        reasons.append("standard weekday traffic")
        
    if is_holiday:
        crowd_points += 35
        reasons.append("public holiday")

    if is_school_vacation:
        crowd_points += 20
        reasons.append("school vacation surge")
        
    if weather_condition == "heavy_rain":
        crowd_points -= 30
        reasons.append("heavy rain deterrent")
    elif weather_condition == "light_rain":
        crowd_points -= 10
        reasons.append("light precipitation")
        
    crowd_points = max(10, min(crowd_points, 100))
    
    if crowd_points < 35:
        crowd_level = "low"
        top_ride_wait = 15
    elif crowd_points < 65:
        crowd_level = "medium"
        top_ride_wait = 35
    elif crowd_points < 85:
        crowd_level = "high"
        top_ride_wait = 60
    else:
        crowd_level = "very_high"
        top_ride_wait = 90
        
    confidence = "Medium" if weather_condition != "sunny" else "High"
    reasoning_str = "Based on " + ", ".join(reasons) + "."
    
    return {
        "crowd_level": crowd_level,
        "predicted_crowd": crowd_level,
        "predicted_wait_minutes": top_ride_wait,
        "confidence": confidence,
        "reasoning": reasoning_str,
        "normalized_crowd_factor": round(crowd_points / 100.0, 2)
    }
