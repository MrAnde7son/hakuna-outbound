import os
import base64
import logging
import random
from datetime import datetime, timedelta
import httpx

log = logging.getLogger("lemlist")
BASE = "https://api.lemlist.com/api"


def _auth_headers():
    key = os.getenv("LEMLIST_API_KEY", "")
    token = base64.b64encode(f":{key}".encode()).decode()
    return {"Authorization": f"Basic {token}", "Content-Type": "application/json"}


def _mock_campaigns():
    statuses = ["active", "active", "paused", "draft"]
    names = [
        "Q2 CISO Outbound — Fintech",
        "Tenable Displacement — Banking",
        "Healthtech Security Leaders",
        "SaaS VP Security Warm",
    ]
    out = []
    for i, n in enumerate(names):
        sent = random.randint(120, 980)
        opens = int(sent * random.uniform(0.35, 0.68))
        replies = int(sent * random.uniform(0.04, 0.14))
        booked = int(replies * random.uniform(0.15, 0.4))
        out.append({
            "id": f"cmp_{i+1}",
            "name": n,
            "status": statuses[i],
            "stats": {
                "sent": sent,
                "openRate": round(opens / max(sent, 1) * 100, 1),
                "replyRate": round(replies / max(sent, 1) * 100, 1),
                "booked": booked,
                "opens": opens,
                "replies": replies,
            },
        })
    return out


def _mock_signals():
    kinds = ["open", "click", "reply", "booked"]
    weights = [0.55, 0.2, 0.2, 0.05]
    names = ["Alex Chen", "Priya Patel", "Jordan Reyes", "Morgan Novak", "Sasha Okafor", "Kai Lindqvist"]
    companies = ["Stellar Fintech", "Meridian Pay", "Paxton Bank", "Lumen Securities", "Helix Trading"]
    now = datetime.utcnow()
    out = []
    for i in range(24):
        k = random.choices(kinds, weights=weights)[0]
        ts = now - timedelta(minutes=random.randint(1, 60 * 48))
        n = random.choice(names)
        c = random.choice(companies)
        out.append({
            "id": f"sig_{i}",
            "type": k,
            "prospect": n,
            "company": c,
            "campaign": random.choice(["Q2 CISO Outbound — Fintech", "Tenable Displacement — Banking"]),
            "timestamp": ts.isoformat() + "Z",
            "title": {
                "open": f"{n} opened your email",
                "click": f"{n} clicked a link",
                "reply": f"{n} replied",
                "booked": f"{n} booked a meeting",
            }[k],
            "subtext": f"{c} · step 2",
        })
    out.sort(key=lambda x: x["timestamp"], reverse=True)
    return out


async def list_campaigns():
    if not os.getenv("LEMLIST_API_KEY"):
        return _mock_campaigns()
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(f"{BASE}/campaigns", headers=_auth_headers())
            if r.status_code >= 400:
                log.warning("lemlist campaigns %s: %s", r.status_code, r.text[:200])
                return _mock_campaigns()
            data = r.json()
            if isinstance(data, list):
                return [{
                    "id": c.get("_id") or c.get("id"),
                    "name": c.get("name", "Untitled"),
                    "status": c.get("status", "active"),
                    "stats": c.get("stats", {"sent": 0, "openRate": 0, "replyRate": 0, "booked": 0}),
                } for c in data]
            return _mock_campaigns()
    except Exception as e:
        log.exception("lemlist campaigns failed: %s", e)
        return _mock_campaigns()


async def enroll_lead(campaign_id: str, email: str, first_name: str = "", last_name: str = "", company: str = ""):
    if not os.getenv("LEMLIST_API_KEY"):
        return {"ok": True, "mock": True, "email": email, "campaign_id": campaign_id}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                f"{BASE}/campaigns/{campaign_id}/leads/{email}",
                headers=_auth_headers(),
                json={"firstName": first_name, "lastName": last_name, "companyName": company},
            )
            return {"ok": r.status_code < 400, "status": r.status_code, "email": email}
    except Exception as e:
        return {"ok": False, "error": str(e), "email": email}


async def recent_activity():
    if not os.getenv("LEMLIST_API_KEY"):
        return _mock_signals()
    try:
        campaigns = await list_campaigns()
        async with httpx.AsyncClient(timeout=20) as client:
            out = []
            for c in campaigns[:4]:
                r = await client.get(f"{BASE}/campaigns/{c['id']}/activities", headers=_auth_headers())
                if r.status_code < 400:
                    for a in (r.json() or [])[:20]:
                        out.append({
                            "id": a.get("_id", ""),
                            "type": a.get("type", "open"),
                            "prospect": a.get("leadFirstName", "") + " " + a.get("leadLastName", ""),
                            "company": a.get("leadCompanyName", ""),
                            "campaign": c["name"],
                            "timestamp": a.get("createdAt", ""),
                            "title": f"{a.get('leadFirstName','Lead')} {a.get('type','activity')}",
                            "subtext": c["name"],
                        })
            out.sort(key=lambda x: x["timestamp"], reverse=True)
            return out or _mock_signals()
    except Exception:
        return _mock_signals()
