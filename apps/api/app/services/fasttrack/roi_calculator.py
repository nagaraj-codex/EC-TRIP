from typing import Literal

def calculate_fasttrack_roi(
    fasttrack_price: float,
    time_saved_minutes: int
) -> dict:
    """
    Calculates the raw monetary value of time saved to categorize ROI.
    """
    if time_saved_minutes <= 0:
        return {
            "rupee_per_minute": 0,
            "category": "SKIP"
        }

    rupee_per_minute = fasttrack_price / time_saved_minutes
    
    # Adjustable thresholds
    if rupee_per_minute > 20.0:  # e.g., > 20 INR per minute is poor ROI
        category = "SKIP"
    elif 10.0 <= rupee_per_minute <= 20.0:
        category = "CONSIDER"
    else:
        category = "RECOMMENDED"

    return {
        "rupee_per_minute": round(rupee_per_minute, 2),
        "category": category
    }
