from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class PriorityEnum(str, Enum):
    CHEAPEST = "Cheapest"
    LEAST_CROWDED = "Least Crowded"
    BEST_BALANCED = "Best Balanced"
    MAXIMUM_RIDES = "Maximum Rides"


class RecommendationRequest(BaseModel):
    park_id: str = Field(..., examples=["wonderla-chennai"])
    candidate_dates: List[str] = Field(..., examples=[["2026-09-12", "2026-09-15"]])
    priority: PriorityEnum = PriorityEnum.BEST_BALANCED
    budget_limit: Optional[float] = 2500.0


class DayEvaluation(BaseModel):
    date: str
    visit_score: float
    crowd_level: str
    predicted_wait_top_ride_minutes: int
    ticket_price: float
    weather_condition: str
    temp_max: float
    fasttrack_verdict: str
    cost_per_minute_saved: float
    confidence: str
    reasoning: str
    source: Optional[str] = "Live External APIs"
    data_status: str = "UNAVAILABLE"


class RecommendationResponse(BaseModel):
    park_id: str
    park_name: str
    recommended_date: str
    summary: str
    evaluations: List[DayEvaluation]
