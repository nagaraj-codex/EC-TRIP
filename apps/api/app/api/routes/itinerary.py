from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.services.integrations.environmental import fetch_solar_uv
from app.services.integrations.resend_mailer import send_itinerary_email
from datetime import datetime

router = APIRouter(prefix="/itinerary", tags=["Dynamic Itinerary Planning"])

class ItineraryRequest(BaseModel):
    park_id: str = Field(default="wonderla-chennai")
    visit_date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    priority: str = Field(default="Best Balanced")
    email: Optional[str] = None
    group_size: int = Field(default=2, ge=1)

class TimelineItem(BaseModel):
    time_slot: str
    activity: str
    category: str  # "Thrill Ride", "Water Ride", "Dining", "Scenic/Family"
    estimated_wait_minutes: int
    tip: str
    uv_exposure: str  # "Low", "Moderate", "High / Caution"

class ItineraryResponse(BaseModel):
    park_id: str
    park_name: str
    visit_date: str
    total_estimated_wait_minutes: int
    uv_shield_applied: bool
    timeline: List[TimelineItem]
    email_status: Optional[str] = None

@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary(req: ItineraryRequest, background_tasks: BackgroundTasks):
    if req.park_id not in settings.PARK_COORDINATES:
        raise HTTPException(status_code=404, detail=f"Park '{req.park_id}' not configured.")

    park = settings.PARK_COORDINATES[req.park_id]
    uv_info = await fetch_solar_uv(park["lat"], park["lon"])
    peak_uv = uv_info.get("peak_uv", 6.0)

    # Base schedule with UV-protective midday routing
    if req.park_id == "wonderla-chennai":
        timeline = [
            TimelineItem(
                time_slot="11:00 AM - 12:00 PM",
                activity="Recoil & Maverick (Outdoor Rollercoasters)",
                category="Thrill Ride",
                estimated_wait_minutes=18,
                tip="Hit signature high-speed coasters first at rope-drop when lines are shortest.",
                uv_exposure="Moderate"
            ),
            TimelineItem(
                time_slot="12:00 PM - 01:00 PM",
                activity="Equinox & Space Gun (High Inversion Thrills)",
                category="Thrill Ride",
                estimated_wait_minutes=22,
                tip="Secure all loose items and phones in wristband RFID lockers beforehand.",
                uv_exposure="High / Caution"
            ),
            TimelineItem(
                time_slot="01:00 PM - 02:00 PM",
                activity="Park Restaurant / Air-Conditioned Food Court",
                category="Dining",
                estimated_wait_minutes=10,
                tip="Refuel during midday sun peak to avoid direct heat exposure.",
                uv_exposure="Low"
            ),
            TimelineItem(
                time_slot="02:00 PM - 04:30 PM",
                activity="Wave Pool & Wonder Splash (Water Rides Zone)",
                category="Water Ride",
                estimated_wait_minutes=15,
                tip="100% synthetic swimwear mandatory. Cool off during peak afternoon hours.",
                uv_exposure="Moderate"
            ),
            TimelineItem(
                time_slot="04:30 PM - 06:00 PM",
                activity="Drop Tower, Termite Coaster & Grand Carousel",
                category="Scenic/Family",
                estimated_wait_minutes=12,
                tip="Winding down as sunset approaches and ambient temperature drops.",
                uv_exposure="Low"
            )
        ]
    elif req.park_id == "mgm-dizzee-chennai":
        timeline = [
            TimelineItem(
                time_slot="10:30 AM - 12:00 PM",
                activity="Roller Coaster & Karnakasi",
                category="Thrill Ride",
                estimated_wait_minutes=15,
                tip="Take advantage of early coastal breeze for big dry thrills.",
                uv_exposure="Moderate"
            ),
            TimelineItem(
                time_slot="12:00 PM - 01:30 PM",
                activity="Caribbean Wave & Water Slides",
                category="Water Ride",
                estimated_wait_minutes=14,
                tip="Synthetic costume required on slides.",
                uv_exposure="Moderate"
            ),
            TimelineItem(
                time_slot="01:30 PM - 02:30 PM",
                activity="Lunch & Indoor 5D Cinema",
                category="Dining",
                estimated_wait_minutes=5,
                tip="Enjoy multi-sensory cinema in air-conditioned hall.",
                uv_exposure="Low"
            ),
            TimelineItem(
                time_slot="02:30 PM - 05:30 PM",
                activity="Big Wheel, Revolution & Water Chute",
                category="Scenic/Family",
                estimated_wait_minutes=10,
                tip="Scenic panoramic views of the Bay of Bengal coast.",
                uv_exposure="Low"
            )
        ]
    else:  # Black Thunder
        timeline = [
            TimelineItem(
                time_slot="10:00 AM - 12:00 PM",
                activity="Mega Wave Pool & Wild River",
                category="Water Ride",
                estimated_wait_minutes=12,
                tip="Largest wave pool in Nilgiri foothills.",
                uv_exposure="Moderate"
            ),
            TimelineItem(
                time_slot="12:00 PM - 01:30 PM",
                activity="Zipline Cycle & Suspension Rope Course",
                category="Thrill Ride",
                estimated_wait_minutes=20,
                tip="Glide across park canopy on suspended tandem bicycles.",
                uv_exposure="High / Caution"
            ),
            TimelineItem(
                time_slot="01:30 PM - 02:30 PM",
                activity="Lakeside Restaurant Dining",
                category="Dining",
                estimated_wait_minutes=10,
                tip="Relax next to natural scenic lake.",
                uv_exposure="Low"
            ),
            TimelineItem(
                time_slot="02:30 PM - 05:30 PM",
                activity="Speed Slides, Thunder Spin & Pedal Boating",
                category="Scenic/Family",
                estimated_wait_minutes=14,
                tip="Wrap up day with calm pedal boating and late water slides.",
                uv_exposure="Low"
            )
        ]

    total_wait = sum(item.estimated_wait_minutes for item in timeline)

    email_status = None
    if req.email:
        background_tasks.add_task(
            send_itinerary_email,
            req.email,
            park["name"],
            req.visit_date,
            88.0
        )
        email_status = f"Itinerary queued for delivery to {req.email}"

    return ItineraryResponse(
        park_id=req.park_id,
        park_name=park["name"],
        visit_date=req.visit_date,
        total_estimated_wait_minutes=total_wait,
        uv_shield_applied=peak_uv > 6.0,
        timeline=timeline,
        email_status=email_status
    )
