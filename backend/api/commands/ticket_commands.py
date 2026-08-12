"""
Bobby — CQRS Commands: Ticket Operations
==========================================
All ticket write operations go through LangGraph.
HITL approval fires before any Freshdesk write.
"""
from __future__ import annotations
import structlog
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from agent.graph import get_bobby_graph
from middleware.auth import get_current_user

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/commands")


# ── Request Models ────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: str


class ResumeApprovalRequest(BaseModel):
    session_id: str
    approved: bool


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Main chat endpoint — processes user message through Bobby graph.
    Returns Bobby's response and any pending approval requests.
    """
    graph = get_bobby_graph()
    config = {"configurable": {"thread_id": request.session_id}}

    initial_state = {
        "messages": [HumanMessage(content=request.message)],
        "user_id": current_user["user_id"],
        "user_name": current_user["name"],
        "user_role": current_user["role"],
        "session_id": request.session_id,
        "escalated": False,
        "needs_human_approval": False,
        "human_approved": None,
        "error": None,
    }

    try:
        result = await graph.ainvoke(initial_state, config=config)

        response = {
            "session_id": request.session_id,
            "message": result.get("final_response", ""),
            "intent": result.get("intent"),
            "escalated": result.get("escalated", False),
        }

        # Check if graph is paused waiting for HITL
        state_snapshot = await graph.aget_state(config)
        if state_snapshot.next and "hitl_node" in state_snapshot.next:
            pending = result.get("pending_action", {})
            response["requires_approval"] = True
            response["pending_action"] = pending
            response["message"] = pending.get("message", "")

        return response

    except Exception as e:
        logger.error("chat.error", error=str(e), session_id=request.session_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/approve")
async def resume_approval(
    request: ResumeApprovalRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Resumes a paused Bobby graph after HITL approval/rejection.
    Called by the React UI when user clicks Approve or Reject.
    """
    graph = get_bobby_graph()
    config = {"configurable": {"thread_id": request.session_id}}

    try:
        # Resume the interrupted graph with the user's decision
        result = await graph.ainvoke(
            {"human_approved": request.approved},
            config=config,
        )

        return {
            "session_id": request.session_id,
            "message": result.get("final_response", ""),
            "approved": request.approved,
            "ticket_id": result.get("ticket_id"),
        }

    except Exception as e:
        logger.error("approve.error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
