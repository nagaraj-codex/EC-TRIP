from enum import Enum
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class DayType(str, Enum):
    WEEKDAY = "weekday"
    WEEKEND = "weekend"
    HOLIDAY = "holiday"

class WeatherCondition(str, Enum):
    SUNNY = "sunny"
    CLOUDY = "cloudy"
    LIGHT_RAIN = "light_rain"
    HEAVY_RAIN = "heavy_rain"

class CrowdLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class GroundTruthObservationBase(BaseModel):
    visit_date: date
    park_id: str = Field(..., example="wonderla-chennai")
    day_type: DayType
    is_school_vacation: bool
    weather_condition: WeatherCondition
    ticket_price_paid: float = Field(..., description="The final baseline price in INR")
    offer_applied: Optional[str] = Field(None, example="online_10pct")
    observed_crowd_overall: CrowdLevel
    observed_wait_top_ride: int = Field(..., description="Raw wait time in minutes")
    fasttrack_purchased: bool

class GroundTruthObservationCreate(GroundTruthObservationBase):
    pass

class GroundTruthObservationResponse(GroundTruthObservationBase):
    id: int
    created_at: str

    class Config:
        orm_mode = True
