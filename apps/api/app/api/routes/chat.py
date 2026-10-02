from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.integrations.conversational_agent import chat_with_agent

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    prompt: str
    context: dict = {}

class ChatResponse(BaseModel):
    response: str
    is_fallback: bool = False

@router.post("/ask", response_model=ChatResponse)
async def ask_advisor(req: ChatRequest):
    """
    Phase 8 requirement: NEVER crash server on API key absence.
    Catches all exceptions and returns HTTP 503 with polite message.
    """
    try:
        result = await chat_with_agent(req.prompt, req.context)
        return ChatResponse(
            response=result.get("response", "I'm having trouble processing that. Please try again."),
            is_fallback=result.get("is_fallback", False)
        )
    except Exception as exc:
        # Return 503 (Service Unavailable) — never 500
        raise HTTPException(
            status_code=503,
            detail="AI advisor is temporarily unavailable. Please try again shortly."
        ) from exc
