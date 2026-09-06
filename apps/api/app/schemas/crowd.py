from pydantic import BaseModel, Field
from typing import Optional

class CrowdReportCreate(BaseModel):
    park_id: str
    visit_date: str
    observed_crowd: str = Field(..., example="high")
    observed_wait_top_ride_minutes: int = Field(..., ge=0, le=240)
    fasttrack_purchased: bool = False
    user_lat: Optional[float] = None
    user_lon: Optional[float] = None
    recaptcha_token: Optional[str] = None

class CrowdReportResponse(BaseModel):
    status: str
    message: str
    verified_on_site: bool
