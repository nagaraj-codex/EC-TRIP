import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.core.config import settings
from app.services.intelligence_hub import evaluate_candidate_date
from app.services.integrations.resend_mailer import send_itinerary_email

router = APIRouter(prefix="/recommendation", tags=["Recommendation"])

class QueueCutRequest(RecommendationRequest):
    email: Optional[str] = None

@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendation(req: QueueCutRequest, background_tasks: BackgroundTasks):
    if req.park_id not in settings.PARK_COORDINATES:
        raise HTTPException(status_code=404, detail=f"Park {req.park_id} not configured.")
        
    park_meta = settings.PARK_COORDINATES[req.park_id]
    pricing_meta = settings.PARK_PRICING[req.park_id]
    
    prices = []
    for date_str in req.candidate_dates:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        price = pricing_meta["weekend"] if dt.weekday() >= 5 else pricing_meta["weekday"]
        prices.append(price)
        
    max_price = max(prices) if prices else 1.0
    
    # Concurrent evaluation
    tasks = []
    for i, date_str in enumerate(req.candidate_dates):
        current_price = prices[i]
        tasks.append(
            evaluate_candidate_date(
                req.park_id, park_meta, date_str, req.priority.value, max_price, current_price, pricing_meta["fasttrack"]
            )
        )
        
    evaluations = await asyncio.gather(*tasks)
    best_eval = max(evaluations, key=lambda x: x.visit_score)
    
    if req.email:
        background_tasks.add_task(
            send_itinerary_email, 
            req.email, 
            park_meta["name"], 
            best_eval.date, 
            best_eval.visit_score
        )
    
    return RecommendationResponse(
        park_id=req.park_id,
        park_name=park_meta["name"],
        recommended_date=best_eval.date,
        summary=f"Optimal visit day is {best_eval.date} with Visit Score {best_eval.visit_score}/100. Expected crowd: {best_eval.crowd_level}.",
        evaluations=evaluations
    )
