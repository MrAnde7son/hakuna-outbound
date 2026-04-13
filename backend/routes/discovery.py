import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from database import get_session
from models import Prospect
from services.apollo import search_people
from services.vertex import score_prospect

router = APIRouter(prefix="/api/discovery", tags=["discovery"])


class DiscoveryRequest(BaseModel):
    icp_description: str = ""
    titles: List[str] = []
    company_size: Optional[str] = None
    industry: Optional[str] = None
    tech_stack: Optional[str] = None
    min_score: int = 70


@router.post("/run")
async def run_discovery(req: DiscoveryRequest, session: Session = Depends(get_session)):
    people = await search_people(
        titles=req.titles,
        company_size=req.company_size,
        industry=req.industry,
        tech_stack=req.tech_stack,
        keywords=req.icp_description,
    )

    async def score(p):
        result = await score_prospect(
            p, req.icp_description, req.titles, req.company_size or "",
            req.industry or "", req.tech_stack or "",
        )
        return p, result

    scored = await asyncio.gather(*(score(p) for p in people))

    out = []
    for p, s in scored:
        if s["score"] < req.min_score:
            continue
        org = p.get("organization") or {}
        out.append({
            "apollo_id": p.get("id"),
            "first_name": p.get("first_name", ""),
            "last_name": p.get("last_name", ""),
            "title": p.get("title", ""),
            "company": org.get("name", ""),
            "email": p.get("email"),
            "linkedin_url": p.get("linkedin_url"),
            "industry": org.get("industry"),
            "company_size": str(org.get("estimated_num_employees", "")),
            "tech_stack": org.get("technologies", ""),
            "location": ", ".join(filter(None, [p.get("city"), p.get("country")])),
            "icp_score": s["score"],
            "score_reason": s["reason"],
            "status": "new",
        })
    out.sort(key=lambda x: x["icp_score"], reverse=True)
    return {"prospects": out, "count": len(out)}
