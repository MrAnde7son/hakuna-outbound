from fastapi import APIRouter
from services.lemlist import recent_activity

router = APIRouter(prefix="/api/signals", tags=["signals"])


@router.get("")
async def get_signals():
    signals = await recent_activity()
    return {"signals": signals}
