from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.optimization.visit_scoring import calculate_visit_score
from app.services.fasttrack.roi_calculator import calculate_fasttrack_roi
from app.services.feedback.feedback import verify_recaptcha
from app.schemas.ground_truth import GroundTruthObservationCreate

router = APIRouter()

class VisitScoreRequest(BaseModel):
    time_saving_minutes: float
    money_saving_inr: float
    weather_fit_score: float
    priority_mode: str = "balanced"

class FastTrackROIRequest(BaseModel):
    fasttrack_price_inr: float
    time_saved_minutes: int

class FeedbackRequest(BaseModel):
    recaptcha_token: str
    observation: GroundTruthObservationCreate

@router.post("/visit-score")
def get_visit_score(request: VisitScoreRequest):
    """
    Returns the mathematically synthesized visit score.
    """
    score = calculate_visit_score(
        time_saving=request.time_saving_minutes,
        money_saving=request.money_saving_inr,
        weather_fit=request.weather_fit_score,
        priority_mode=request.priority_mode
    )
    return {"visit_score": score}

@router.post("/fasttrack-roi")
def get_fasttrack_roi(request: FastTrackROIRequest):
    """
    Returns objective fasttrack ROI categorization.
    """
    result = calculate_fasttrack_roi(
        fasttrack_price=request.fasttrack_price_inr,
        time_saved_minutes=request.time_saved_minutes
    )
    return result

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Secures crowdsourced feedback using reCAPTCHA.
    """
    is_human = await verify_recaptcha(request.recaptcha_token)
    if not is_human:
        raise HTTPException(status_code=403, detail="reCAPTCHA verification failed")
    
    # Normally, we would save to the DB here using sqlalchemy/supabase
    # e.g. db.add(Observation(**request.observation.dict()))
    
    return {"status": "success", "message": "Observation securely received"}
