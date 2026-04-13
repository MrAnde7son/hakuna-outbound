from fastapi import APIRouter
from services.lemlist import list_campaigns

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.get("")
async def get_campaigns():
    campaigns = await list_campaigns()
    return {"campaigns": campaigns}
