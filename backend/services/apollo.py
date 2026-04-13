import os
import logging
import random
from typing import List, Optional

import httpx

log = logging.getLogger("apollo")

APOLLO_URL = "https://api.apollo.io/api/v1/mixed_people/api_search"
APOLLO_ENRICH_URL = "https://api.apollo.io/api/v1/people/match"

MOCK_FIRST = ["Alex", "Priya", "Jordan", "Morgan", "Sasha", "Noa", "Kai", "Riley", "Sam", "Taylor", "Devon", "Harper"]
MOCK_LAST = ["Chen", "Patel", "Reyes", "Novak", "Okafor", "Ibrahim", "Kowalski", "Nguyen", "Adeyemi", "Lindqvist"]
MOCK_COMPANIES = [
    ("Stellar Fintech", "fintech", "201-500", "AWS, Okta, Tenable"),
    ("Northwind Capital", "fintech", "501-1000", "GCP, CrowdStrike, Snowflake"),
    ("Meridian Pay", "fintech", "51-200", "Azure, Qualys, Datadog"),
    ("Paxton Bank", "banking", "1001-5000", "AWS, Splunk, Tenable"),
    ("Lumen Securities", "fintech", "201-500", "AWS, Wiz, Tenable"),
    ("Helix Trading", "fintech", "51-200", "GCP, Rapid7, Snowflake"),
    ("Orbit Health", "healthtech", "201-500", "AWS, Okta, Qualys"),
    ("Corteza Cloud", "saas", "501-1000", "GCP, Wiz, Datadog"),
]
MOCK_TITLES = ["CISO", "VP Security", "Head of Infosec", "Director of Security", "Chief Security Officer"]


def _mock_people(titles, n=20):
    out = []
    pool_titles = titles or MOCK_TITLES
    for i in range(n):
        comp = random.choice(MOCK_COMPANIES)
        fn = random.choice(MOCK_FIRST)
        ln = random.choice(MOCK_LAST)
        out.append({
            "id": f"mock_{i}_{random.randint(1000,9999)}",
            "first_name": fn,
            "last_name": ln,
            "title": random.choice(pool_titles),
            "organization": {
                "name": comp[0],
                "industry": comp[1],
                "estimated_num_employees": comp[2],
                "technologies": comp[3],
            },
            "email": f"{fn.lower()}.{ln.lower()}@{comp[0].lower().replace(' ', '')}.com",
            "linkedin_url": f"https://linkedin.com/in/{fn.lower()}-{ln.lower()}",
            "city": random.choice(["San Francisco", "New York", "Austin", "Boston", "Chicago"]),
            "country": "United States",
        })
    return out


def _as_list(v) -> List[str]:
    if v is None:
        return []
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    return [s.strip() for s in str(v).split(",") if s.strip()]


async def search_people(
    titles: Optional[List[str]] = None,
    company_size=None,
    industry=None,
    tech_stack=None,
    keywords: str = "",
    seniorities: Optional[List[str]] = None,
    locations: Optional[List[str]] = None,
    page: int = 1,
    per_page: int = 25,
):
    api_key = os.getenv("APOLLO_API_KEY")
    if not api_key:
        return _mock_people(titles)

    industries = _as_list(industry)
    sizes = _as_list(company_size)
    techs = _as_list(tech_stack)

    payload = {
        "page": max(1, int(page)),
        "per_page": max(1, min(100, int(per_page))),
        "person_titles": titles or [],
        "person_seniorities": seniorities or [],
        "person_locations": locations or [],
    }
    if sizes:
        payload["organization_num_employees_ranges"] = sizes
    # Apollo's technology filter expects internal UIDs (e.g. "tenable_network_security"),
    # not display names. Route UIDs to the filter and plain names to org keyword tags
    # (a soft OR-style match); strict tech filtering happens in Gemini scoring.
    uid_techs = [t.lower() for t in techs if "_" in t]
    name_techs = [t for t in techs if "_" not in t]
    if uid_techs:
        payload["currently_using_any_of_technology_uids"] = uid_techs
    tags = industries + name_techs
    if tags:
        payload["q_organization_keyword_tags"] = tags

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                APOLLO_URL,
                json=payload,
                headers={"X-Api-Key": api_key, "Cache-Control": "no-cache", "Content-Type": "application/json"},
            )
            if r.status_code >= 400:
                log.warning("apollo search %s: %s", r.status_code, r.text[:200])
                return []
            data = r.json()
            return data.get("people", []) or data.get("contacts", []) or []
    except Exception as e:
        log.exception("apollo search failed: %s", e)
        return []


def _has_usable_email(person: dict) -> bool:
    email = (person.get("email") or "").lower()
    if not email or "@" not in email:
        return False
    if "email_not_unlocked" in email or "domain.com" in email:
        return False
    status = (person.get("email_status") or "").lower()
    return status in ("", "verified", "likely_to_engage")


async def enrich_person(person: dict) -> dict:
    """Unlock email for a single prospect via Apollo's people/match endpoint.

    Search results return placeholder emails; match consumes credits but reveals
    the real address. No-ops in mock mode or when the email is already usable.
    """
    api_key = os.getenv("APOLLO_API_KEY")
    if not api_key or _has_usable_email(person):
        return person

    org = person.get("organization") or {}
    params = {
        "reveal_personal_emails": "true",
        "first_name": person.get("first_name", ""),
        "last_name": person.get("last_name", ""),
        "organization_name": org.get("name", ""),
        "domain": org.get("primary_domain") or org.get("website_url", ""),
        "linkedin_url": person.get("linkedin_url", ""),
    }
    params = {k: v for k, v in params.items() if v}

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                APOLLO_ENRICH_URL,
                params=params,
                headers={"X-Api-Key": api_key, "Content-Type": "application/json"},
            )
            if r.status_code >= 400:
                log.warning("apollo enrich %s: %s", r.status_code, r.text[:200])
                return person
            data = r.json() or {}
            matched = data.get("person") or {}
            email = matched.get("email") or ""
            if email and "email_not_unlocked" not in email.lower():
                person["email"] = email
            return person
    except Exception as e:
        log.warning("apollo enrich failed: %s", e)
        return person
