from fastapi import APIRouter, HTTPException, Request
from app.schemas.crowd import CrowdReportCreate, CrowdReportResponse
from app.core.config import settings
from app.services.feedback.feedback import check_rate_limit, record_observation

router = APIRouter(prefix="/feedback", tags=["Crowdsourcing"])

@router.post("/report", response_model=CrowdReportResponse)
async def submit_crowd_report(report: CrowdReportCreate, request: Request):
    # 1. Anti-Abuse Rate Limiting
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. You can submit up to 5 crowd reports per minute."
        )

    # 2. Geofence Verification (~3km radius)
    verified = False
    if report.user_lat and report.user_lon and report.park_id in settings.PARK_COORDINATES:
        park = settings.PARK_COORDINATES[report.park_id]
        dist = ((report.user_lat - park["lat"])**2 + (report.user_lon - park["lon"])**2)**0.5
        verified = dist < 0.03

    # 3. Record into active ground-truth observation store
    record_observation(
        park_id=report.park_id,
        visit_date=report.visit_date,
        observed_crowd=report.observed_crowd,
        observed_wait_top_ride_minutes=report.observed_wait_top_ride_minutes,
        fasttrack_purchased=report.fasttrack_purchased,
        verified_on_site=verified,
        user_lat=report.user_lat,
        user_lon=report.user_lon
    )

    return CrowdReportResponse(
        status="success",
        message="Observation recorded into QueueCut ground-truth dataset.",
        verified_on_site=verified
    )
