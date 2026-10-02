import os
import httpx
from typing import Dict, Any
from app.core.config import settings
from app.api.routes.parks import load_catalog


def get_heuristic_response(user_message: str, park_context: dict) -> str:
    msg = user_message.lower()
    park_id = park_context.get("park_id", "wonderla-chennai")
    park = load_catalog().get("parks", {}).get(park_id)
    if not park:
        return "I couldn't verify that park in QueueCut's current catalog."
    park_name = park.get("name", park_id)
    pricing = park.get("ticket_pricing", {}).get("regular_rates", {})
    weekday = pricing.get("adult_weekday")
    weekend = pricing.get("adult_weekend")
    official_url = park.get("official_website")

    if "fasttrack" in msg or "fast track" in msg or "pass" in msg:
        return f"FastTrack availability and pricing for {park_name} are not verified in the current catalog. Check the official source: {official_url or 'unavailable'}."

    if "cost" in msg or "price" in msg or "ticket" in msg or "tariff" in msg:
        if weekday is not None or weekend is not None:
            return f"{park_name} lists adult pricing of {weekday or 'not verified'} on weekdays and {weekend or 'not verified'} on weekends. Verify current terms at {official_url or 'the official park source'}."
        return f"Ticket pricing for {park_name} is not verified in the current catalog. Check {official_url or 'the official park source'}."

    if "water" in msg or "swim" in msg or "dress" in msg or "costume" in msg:
        dress_code = park.get("dress_code_policy", {}).get("water_rides")
        return (
            dress_code
            or f"Dress-code information for {park_name} is not verified. Check {official_url or 'the official park source'}."
        )

    if (
        "timing" in msg
        or "hour" in msg
        or "open" in msg
        or "reach" in msg
        or "arrive" in msg
    ):
        hours = park.get("operating_hours")
        return (
            f"Operating hours for {park_name}: {hours}. Confirm changes at {official_url or 'the official park source'}."
            if hours
            else f"Operating hours for {park_name} are not verified."
        )

    return f"I can help plan {park_name}, but current weather, crowd and ride-status inputs were not supplied or verified. Check the official source before relying on a visit plan: {official_url or 'unavailable'}."


async def chat_with_agent(user_message: str, park_context: dict) -> Dict[str, Any]:
    """
    Queries Gemini 1.5 Flash with real context from recommendation engine
    for conversational trip planning. Falls back gracefully to expert heuristics
    when offline or without API key.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return {
            "response": get_heuristic_response(user_message, park_context),
            "is_fallback": True,
        }

    if settings.LLM_PROVIDER.lower() != "gemini":
        return {
            "response": get_heuristic_response(user_message, park_context),
            "is_fallback": True,
        }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={api_key}"

    system_prompt = (
        "You are the QueueCut Park Advisor. Base all answers strictly on computed Visit Scores, "
        "verified 2026 park catalog pricing, and factual telemetry provided in context. Never manufacture fake wait times."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"System Context: {system_prompt}\nPark Context: {park_context}\nUser: {user_message}"
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            answer = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "I'm sorry, I couldn't process that.")
            )
            return {"response": answer, "is_fallback": False}
        except Exception:
            return {
                "response": get_heuristic_response(user_message, park_context),
                "is_fallback": True,
            }
