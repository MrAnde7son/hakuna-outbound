import os
import json
import random
import asyncio
from typing import List, Dict, Any, AsyncGenerator

_vertex_ready = False
_model = None


def _init():
    global _vertex_ready, _model
    if _vertex_ready:
        return _model
    project = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "us-central1")
    model_name = os.getenv("VERTEX_MODEL", "gemini-2.0-flash")
    if not project:
        return None
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel
        vertexai.init(project=project, location=location)
        _model = GenerativeModel(model_name)
        _vertex_ready = True
        return _model
    except Exception:
        return None


AGENT_SYSTEM_PROMPT = """You are Hakuna, an outbound sales agent copilot.
You help go-to-market operators run ICP discovery, enrollment, and follow-up.
You have conceptual access to these tools:
- apollo_search(titles, industry, company_size, tech_stack) -> prospects
- lemlist_enroll(prospect_ids, campaign_id) -> enrollment results
- campaign_stats() -> campaign performance
When asked to "find" people, describe what you would search for and summarize likely results.
When asked to "enroll", confirm the campaign and list the prospects.
Be concise, punchy, and operator-focused. Use short paragraphs and bullet points."""


def _heuristic_score(prospect: Dict[str, Any], titles: List[str],
                     industry: str, tech_stack: str) -> Dict[str, Any]:
    score = 60
    org = prospect.get("organization", {}) or {}
    title = (prospect.get("title") or "").lower()
    if titles and any(t.lower() in title for t in titles):
        score += 15
    if industry and industry.lower() in (org.get("industry", "") or "").lower():
        score += 8
    if tech_stack:
        techs = [t.strip().lower() for t in tech_stack.split(",")]
        orgtech = (org.get("technologies", "") or "").lower()
        if any(t in orgtech for t in techs):
            score += 10
    score += random.randint(-5, 8)
    score = max(40, min(99, score))
    if score >= 85:
        reason = "Strong title + industry + tech match"
    elif score >= 70:
        reason = "Good title fit, partial tech/industry match"
    else:
        reason = "Weak ICP overlap"
    return {"score": score, "reason": reason}


async def score_prospect(prospect: Dict[str, Any], icp_description: str, titles: List[str],
                         company_size: str, industry: str, tech_stack: str) -> Dict[str, Any]:
    """Score a single prospect against ICP. Returns {score, reason}."""
    model = _init()
    if not model:
        return _heuristic_score(prospect, titles, industry, tech_stack)

    try:
        prompt = f"""Score this prospect 0-100 against the ICP.
ICP: {icp_description}
Titles: {titles}
Company size: {company_size}
Industry: {industry}
Tech stack: {tech_stack}

Prospect:
{json.dumps({
    "title": prospect.get("title"),
    "company": (prospect.get("organization") or {}).get("name"),
    "industry": (prospect.get("organization") or {}).get("industry"),
    "size": (prospect.get("organization") or {}).get("estimated_num_employees"),
    "tech": (prospect.get("organization") or {}).get("technologies"),
})}

Return only JSON: {{"score": <int>, "reason": "<one sentence>"}}"""
        resp = await asyncio.to_thread(model.generate_content, prompt)
        text = resp.text.strip().strip("`").replace("json\n", "")
        data = json.loads(text)
        return {"score": int(data.get("score", 60)), "reason": data.get("reason", "")}
    except Exception:
        return _heuristic_score(prospect, titles, industry, tech_stack)


async def agent_stream(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    model = _init()
    user_last = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")

    if not model:
        canned = _canned_response(user_last)
        for tok in canned.split(" "):
            yield tok + " "
            await asyncio.sleep(0.025)
        return

    try:
        history = "\n".join(f"{m.get('role','user').upper()}: {m.get('content','')}" for m in messages)
        prompt = f"{AGENT_SYSTEM_PROMPT}\n\nConversation:\n{history}\n\nASSISTANT:"
        resp = await asyncio.to_thread(model.generate_content, prompt, stream=True)
        for chunk in resp:
            if hasattr(chunk, "text") and chunk.text:
                yield chunk.text
    except Exception:
        canned = _canned_response(user_last)
        for tok in canned.split(" "):
            yield tok + " "
            await asyncio.sleep(0.02)


def _canned_response(user_msg: str) -> str:
    u = user_msg.lower()
    if "find" in u and "ciso" in u:
        return ("Searching Apollo for CISOs at US fintechs using Tenable.\n\n"
                "Drafted query:\n• Titles: CISO, VP Security, Head of Infosec\n"
                "• Industry: fintech / banking\n• Geo: United States\n• Tech: Tenable\n\n"
                "Estimated 10 strong matches. Would you like me to run it and score against your ICP?")
    if "summar" in u and "campaign" in u:
        return ("This week across 4 active sequences:\n• 1,842 emails sent\n• 52% open rate (↑4pts)\n"
                "• 9.3% reply rate (↑1.2pts)\n• 11 meetings booked\n\nTop performer: 'Q2 CISO Outbound — Fintech'.")
    if "follow" in u and "up" in u:
        return ("Today's priority follow-ups:\n1. Alex Chen (Stellar Fintech) — replied 12h ago, hot\n"
                "2. Priya Patel (Meridian Pay) — opened 4x, no reply\n3. Jordan Reyes (Paxton Bank) — booked, send prep")
    if "pause" in u:
        return ("I can pause sequences under 5% reply rate. 'Healthtech Security Leaders' is at 3.1% — "
                "recommend pausing. Confirm to proceed.")
    if "draft" in u:
        return ("Draft follow-up:\n\nHi Alex — appreciated your note. Quick follow-up: would a 20-min call "
                "Thursday work to walk through how teams like Stellar displaced Tenable in Q1? "
                "Happy to send a one-pager first if easier.")
    return ("I can run ICP discovery, enroll prospects in Lemlist, summarize campaign performance, "
            "or draft follow-ups. What would you like to do first?")
