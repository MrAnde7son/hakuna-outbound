import os
import logging
import random
import httpx

log = logging.getLogger("apollo")

APOLLO_URL = "https://api.apollo.io/api/v1/mixed_people/api_search"

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


async def search_people(titles=None, company_size=None, industry=None, tech_stack=None, keywords=None):
    api_key = os.getenv("APOLLO_API_KEY")
    if not api_key:
        return _mock_people(titles)

    kw_parts = [keywords or "", industry or ""]
    payload = {
        "page": 1,
        "per_page": 25,
        "person_titles": titles or [],
        "q_keywords": " ".join(p for p in kw_parts if p).strip(),
    }
    if company_size:
        payload["organization_num_employees_ranges"] = [company_size]
    if tech_stack:
        payload["currently_using_any_of_technology_uids"] = [t.strip().lower() for t in tech_stack.split(",")]

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                APOLLO_URL,
                json=payload,
                headers={"X-Api-Key": api_key, "Cache-Control": "no-cache", "Content-Type": "application/json"},
            )
            if r.status_code >= 400:
                log.warning("apollo search %s: %s", r.status_code, r.text[:200])
                return _mock_people(titles)
            data = r.json()
            return data.get("people", []) or data.get("contacts", []) or _mock_people(titles)
    except Exception as e:
        log.exception("apollo search failed: %s", e)
        return _mock_people(titles)
