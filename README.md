# Hakuna Outbound

A CRM outbound agent dashboard. Combines Apollo (prospect discovery), Lemlist (sequencing), and Vertex AI Gemini (ICP scoring + an operator copilot) into a single dark-themed operator console.

Stack: **FastAPI + SQLite** backend, **React (Vite) + Tailwind + Zustand + React Query** frontend. Works fully in mock mode — no API keys required to demo.

---

## Repo layout

```
/backend    FastAPI service, SQLite persistence, service wrappers
/frontend   Vite + React + Tailwind dashboard
```

## Backend setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # optional — omit to run in mock mode
uvicorn main:app --reload --port 8000
```

Health check: `curl http://localhost:8000/api/health`

### Environment variables (`backend/.env`)

| Var | Purpose |
| --- | --- |
| `APOLLO_API_KEY` | Apollo People Search API |
| `LEMLIST_API_KEY` | Lemlist v2 API (Basic auth on `:KEY`) |
| `GCP_PROJECT_ID` | GCP project for Vertex AI |
| `GCP_LOCATION` | Vertex region (default `us-central1`) |
| `VERTEX_MODEL` | Gemini model (default `gemini-2.5-flash`) |

Any missing key automatically falls back to realistic mock data, so the full app is always demoable.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens on http://localhost:5173, talking to the backend at `VITE_API_URL` (defaults to `http://localhost:8000`).

---

## Docker

Run the whole stack containerized:

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend → http://localhost:8000
- SQLite persists in the `hakuna-db` named volume.

Pass real API keys via environment (any omitted → mock mode):

```bash
APOLLO_API_KEY=xxx LEMLIST_API_KEY=yyy GCP_PROJECT_ID=my-proj \
  docker compose up --build
```

If the frontend needs to reach the backend at a non-default URL (e.g. deployed), rebuild with:

```bash
VITE_API_URL=https://api.example.com docker compose build frontend
```

## Getting API keys

### Apollo
1. Sign in at https://app.apollo.io/
2. Settings → Integrations → API
3. Generate a key and paste it as `APOLLO_API_KEY`.

### Lemlist
1. Sign in at https://app.lemlist.com/
2. Settings → Integrations → API
3. Copy your API key. The backend wraps it in HTTP Basic auth as `:KEY` per Lemlist's v2 spec.

### Vertex AI (Gemini)
1. Create/select a GCP project — copy its ID to `GCP_PROJECT_ID`.
2. Enable the Vertex AI API: `gcloud services enable aiplatform.googleapis.com`.
3. Authenticate locally — easiest is `gcloud auth application-default login`.
4. For production, create a service account with the `Vertex AI User` role, download the JSON key, and set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json` before starting uvicorn.

## Running in mock mode (no keys)

Leave `backend/.env` empty (or skip creating it). The service detects missing credentials and:
- Apollo → realistic fake prospects with varied titles, companies, tech stacks
- Lemlist → synthetic campaigns and a rolling signal feed (opens/replies/bookings)
- Vertex → heuristic ICP scoring + canned agent responses streamed token-by-token

Every page, chart, and interaction works end-to-end in mock mode — ideal for demos, UI dev, or onboarding.

---

## API surface

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/discovery/run` | Apollo search + Gemini scoring |
| `GET`  | `/api/prospects` | Saved prospects (SQLite) |
| `POST` | `/api/prospects/save` | Persist discovery results |
| `POST` | `/api/prospects/enroll` | Enroll into a Lemlist campaign |
| `GET`  | `/api/campaigns` | Campaign list + stats |
| `GET`  | `/api/signals` | Recent opens/clicks/replies/bookings |
| `POST` | `/api/agent/chat` | Streaming Gemini copilot |
| `GET`  | `/api/health` | Mock-mode diagnostic |

## Features

- **Dashboard** — pipeline stats, top prospects, signal feed preview, live campaigns.
- **ICP Discovery** — natural-language ICP + structured filters, animated search, save-to-prospects.
- **Prospects** — table with ICP score bars, status tags, bulk enroll with campaign picker modal.
- **Campaigns** — Lemlist sequences with sent/open/reply/booked metrics and controls.
- **Signals** — live-polled engagement feed, respond CTA on replies and bookings.
- **AI Agent** — streaming Gemini chat with quick-action prompts.
- **Pipeline** — 6-stage funnel + per-prospect journey tracker.
