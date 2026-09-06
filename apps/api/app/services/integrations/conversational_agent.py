import os
import httpx
from typing import Dict, Any

def get_heuristic_response(user_message: str, park_context: dict) -> str:
    msg = user_message.lower()
    park_id = park_context.get("park_id", "wonderla-chennai")
    
    if "fasttrack" in msg or "fast track" in msg or "pass" in msg:
        if park_id == "wonderla-chennai":
            return (
                "For Wonderla Chennai, FastTrack passes are priced at ₹1,312 (100% of adult weekday base). "
                "QueueCut's ROI calculator recommends FastTrack on peak Saturdays and public holidays when "
                "wait times exceed 45 minutes on Maverick and Recoil. On Tuesdays/Wednesdays, lines average ~15m, "
                "so regular entry is much higher value."
            )
        else:
            return (
                f"For {park_id.replace('-', ' ').title()}, FastTrack is not actively required because average "
                "queue wait times rarely exceed 25 minutes on weekdays. We recommend standard admission."
            )
            
    if "cost" in msg or "price" in msg or "ticket" in msg or "tariff" in msg:
        if park_id == "wonderla-chennai":
            return "Wonderla Chennai 2026 tariff is ₹1,312 for weekdays and ₹1,549 for weekends. College students get a 20% discount with valid ID."
        elif park_id == "mgm-dizzee-chennai":
            return "MGM Dizzee World is ₹699 on weekdays and ₹849 on weekends, covering all dry rides and water world."
        else:
            return "Black Thunder Coimbatore has a flat ₹1,090 adult admission ticket covering all water rides and wave pools."

    if "water" in msg or "swim" in msg or "dress" in msg or "costume" in msg:
        return (
            "100% synthetic/nylon/polyester swimwear is mandatory across all water ride zones. "
            "Cotton clothing, denim, and sarees are strictly prohibited on thrill slides for mechanical safety. "
            "Lockers and synthetic swimwear are available for rent at the park changing pavilions."
        )

    if "timing" in msg or "hour" in msg or "open" in msg or "reach" in msg or "arrive" in msg:
        return (
            "Theme park gates open at 10:30 AM (dry thrill rides operate until 6:00 PM; water park runs from 12:30 PM to 5:00 PM). "
            "We advise arriving at 10:00 AM to complete security screening and head straight to signature coasters before 11:30 AM."
        )

    return (
        f"Based on QueueCut's predictive model for {park_id.replace('-', ' ').title()}, the optimal visiting strategy "
        "is to arrive by rope-drop at 10:15 AM, ride high-inversion outdoor coasters first, take an AC dining break between "
        "12:30 PM–1:45 PM during peak UV hours, and enjoy the wave pool and water slides in the afternoon."
    )

async def chat_with_agent(user_message: str, park_context: dict) -> Dict[str, Any]:
    """
    Queries Gemini 1.5 Flash with real context from recommendation engine 
    for conversational trip planning. Falls back gracefully to expert heuristics
    when offline or without API key.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"response": get_heuristic_response(user_message, park_context), "is_fallback": True}
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    system_prompt = (
        "You are the QueueCut Park Advisor. Base all answers strictly on computed Visit Scores, "
        "verified 2026 park catalog pricing, and factual telemetry provided in context. Never manufacture fake wait times."
    )
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"System Context: {system_prompt}\nPark Context: {park_context}\nUser: {user_message}"}
                ]
            }
        ]
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            answer = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "I'm sorry, I couldn't process that.")
            return {"response": answer, "is_fallback": False}
        except Exception:
            return {"response": get_heuristic_response(user_message, park_context), "is_fallback": True}
