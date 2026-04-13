import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from database import init_db
from routes import discovery, prospects, campaigns, signals, agent

app = FastAPI(title="Hakuna Outbound API")

_cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_env.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discovery.router)
app.include_router(prospects.router)
app.include_router(campaigns.router)
app.include_router(signals.router)
app.include_router(agent.router)


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "mock_mode": {
            "apollo": not bool(os.getenv("APOLLO_API_KEY")),
            "lemlist": not bool(os.getenv("LEMLIST_API_KEY")),
            "vertex": not bool(os.getenv("GCP_PROJECT_ID")),
        },
    }
