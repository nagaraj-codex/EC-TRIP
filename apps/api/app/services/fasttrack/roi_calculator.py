from typing import Dict, Any

def calculate_fasttrack_roi(fasttrack_price: float, expected_wait_saved_minutes: float) -> Dict[str, Any]:
    effective_saved = max(expected_wait_saved_minutes, 1.0)
    cost_per_minute = round(fasttrack_price / effective_saved, 2)
    
    if expected_wait_saved_minutes < 20:
        verdict = "SKIP"
    elif 20 <= expected_wait_saved_minutes <= 60:
        verdict = "CONSIDER"
    else:
        verdict = "RECOMMENDED"
        
    return {
        "cost_per_minute_saved": cost_per_minute,
        "verdict": verdict,
        "minutes_saved": round(expected_wait_saved_minutes, 1)
    }
