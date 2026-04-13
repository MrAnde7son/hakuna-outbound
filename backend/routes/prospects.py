from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import Prospect
from services.lemlist import enroll_lead

router = APIRouter(prefix="/api/prospects", tags=["prospects"])


class SaveProspectsRequest(BaseModel):
    prospects: List[dict]


class EnrollRequest(BaseModel):
    prospect_ids: List[int]
    campaign_id: str


@router.get("")
def list_prospects(session: Session = Depends(get_session)):
    rows = session.exec(select(Prospect).order_by(Prospect.icp_score.desc())).all()
    return {"prospects": [r.model_dump() for r in rows]}


@router.post("/save")
def save_prospects(req: SaveProspectsRequest, session: Session = Depends(get_session)):
    saved = []
    for p in req.prospects:
        existing = None
        if p.get("apollo_id"):
            existing = session.exec(
                select(Prospect).where(Prospect.apollo_id == p["apollo_id"])
            ).first()
        if existing:
            saved.append(existing.model_dump())
            continue
        row = Prospect(**{k: v for k, v in p.items() if k in Prospect.model_fields})
        session.add(row)
        session.commit()
        session.refresh(row)
        saved.append(row.model_dump())
    return {"saved": saved, "count": len(saved)}


@router.post("/enroll")
async def enroll(req: EnrollRequest, session: Session = Depends(get_session)):
    results = []
    for pid in req.prospect_ids:
        p = session.get(Prospect, pid)
        if not p or not p.email:
            results.append({"id": pid, "ok": False, "error": "missing prospect or email"})
            continue
        r = await enroll_lead(
            req.campaign_id, p.email, p.first_name, p.last_name, p.company,
        )
        if r.get("ok"):
            p.status = "enrolled"
            p.campaign_id = req.campaign_id
            session.add(p)
            session.commit()
        results.append({"id": pid, **r})
    return {"results": results}
