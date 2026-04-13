from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Prospect(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    apollo_id: Optional[str] = Field(default=None, index=True)
    first_name: str = ""
    last_name: str = ""
    title: str = ""
    company: str = ""
    email: Optional[str] = None
    linkedin_url: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    tech_stack: Optional[str] = None
    location: Optional[str] = None
    icp_score: float = 0.0
    score_reason: Optional[str] = None
    status: str = "new"  # new | warm | enrolled | replied | qualified
    campaign_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
