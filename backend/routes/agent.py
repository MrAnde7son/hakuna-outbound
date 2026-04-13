from typing import List
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.vertex import agent_stream

router = APIRouter(prefix="/api/agent", tags=["agent"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@router.post("/chat")
async def chat(req: ChatRequest):
    async def gen():
        async for tok in agent_stream([m.model_dump() for m in req.messages]):
            yield tok
    return StreamingResponse(gen(), media_type="text/plain")
