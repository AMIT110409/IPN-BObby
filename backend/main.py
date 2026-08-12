"""
Bobby — FastAPI Main Application
==================================
Entry point for the Bobby backend API.
Registers all routers and startup logic.
"""
from __future__ import annotations
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.settings import settings
from api.commands import ticket_commands, account_commands
from api.queries import ticket_queries, knowledge_queries
from api.routes import health

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    logger.info(
        "bobby.startup",
        env=settings.app_env.value,
        freshdesk_domain=settings.freshdesk_domain or "NOT SET",
    )
    # Pre-warm the graph on startup
    from agent.graph import get_bobby_graph
    get_bobby_graph()
    logger.info("bobby.graph_ready")
    yield
    logger.info("bobby.shutdown")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Bobby — AI Service Management API",
    description="Bobby's backend API. Commands go through LangGraph. Queries go direct.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
# CQRS Commands — go through LangGraph
app.include_router(ticket_commands.router,  tags=["Commands"])
app.include_router(account_commands.router, tags=["Commands"])

# CQRS Queries — bypass LangGraph, direct to API/DB
app.include_router(ticket_queries.router,    tags=["Queries"])
app.include_router(knowledge_queries.router, tags=["Queries"])

# Health
app.include_router(health.router, tags=["Health"])


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": "Bobby AI",
        "env": settings.app_env.value,
        "status": "running",
        "docs": "/docs",
    }
