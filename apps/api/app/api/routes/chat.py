from fastapi import APIRouter
from pydantic import BaseModel
from app.services.integrations.conversational_agent import chat_with_agent

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    prompt: str
    context: dict

class ChatResponse(BaseModel):
    response: str

@router.post("/ask", response_model=ChatResponse)
async def ask_advisor(req: ChatRequest):
    result = await chat_with_agent(req.prompt, req.context)
    return ChatResponse(response=result.get("response", "Error processing request."))
