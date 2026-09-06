import json
import os
from datetime import date

# Simulated external JSON file
EXTERNAL_DATA_PATH = os.path.join(os.path.dirname(__file__), "../../../../../data/external/state_school_vacations.json")

def load_vacation_data() -> dict:
    try:
        with open(EXTERNAL_DATA_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Provide sensible defaults if the file hasn't been created yet
        return {
            "Tamil Nadu": [
                {"start": "2026-05-01", "end": "2026-06-15"},
                {"start": "2026-09-25", "end": "2026-10-05"}, # Quarterly
                {"start": "2026-12-24", "end": "2026-12-31"}  # Half-yearly
            ]
        }

def is_academic_break(target_date: date, state: str = "Tamil Nadu") -> bool:
    """
    Checks if a given date falls within school vacations for a specific state.
    """
    data = load_vacation_data()
    state_vacations = data.get(state, [])
    
    date_str = target_date.strftime("%Y-%m-%d")
    for period in state_vacations:
        if period["start"] <= date_str <= period["end"]:
            return True
            
    return False
