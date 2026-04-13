import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from database import get_session
from models import Prospect
from services.apollo import search_people, enrich_person
from services.vertex import score_prospect

router = APIRouter(prefix="/api/discovery", tags=["discovery"])


class DiscoveryRequest(BaseModel):
    icp_description: str = ""
    titles: List[str] = []
    seniorities: List[str] = []
    company_size: Optional[str] = None  # comma-separated or single range
    industry: Optional[str] = None      # comma-separated or single value
    tech_stack: Optional[str] = None    # comma-separated uids
    locations: List[str] = []
    min_score: int = 70
    page: int = 1
    per_page: int = 25
    enrich: bool = True  # unlock emails via people/match for scored prospects


@router.post("/run")
async def run_discovery(req: DiscoveryRequest, session: Session = Depends(get_session)):
    people = await search_people(
        titles=req.titles,
        seniorities=req.seniorities,
        company_size=req.company_size,
        industry=req.industry,
        tech_stack=req.tech_stack,
        locations=req.locations,
        keywords=req.icp_description,
        page=req.page,
        per_page=req.per_page,
    )

    async def score(p):
        result = await score_prospect(
            p, req.icp_description, req.titles, req.company_size or "",
            req.industry or "", req.tech_stack or "",
        )
        return p, result

    scored = await asyncio.gather(*(score(p) for p in people))
    qualified = [(p, s) for p, s in scored if s["score"] >= req.min_score]

    if req.enrich and qualified:
        enriched = await asyncio.gather(*(enrich_person(p) for p, _ in qualified))
        qualified = list(zip(enriched, (s for _, s in qualified)))

    out = []
    for p, s in qualified:
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
