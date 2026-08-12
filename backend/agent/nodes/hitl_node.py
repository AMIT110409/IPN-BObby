"""
Bobby — HITL Node (Human-in-the-Loop)
=======================================
Uses LangGraph interrupt() to pause the graph and wait for
user approval from the frontend before executing write actions.

Flow:
  ticket_node / account_node sets needs_human_approval=True
       ↓
  hitl_node calls interrupt() — graph PAUSES
       ↓
  React UI shows approval card to user
       ↓
  User clicks Approve or Reject
       ↓
  Frontend calls POST /commands/resume-approval
       ↓
  Graph resumes with human_approved = True/False
       ↓
  execute_action_node or cancelled_node
"""
from __future__ import annotations
import structlog
from langgraph.types import interrupt
from agent.state import TicketState
from integrations.freshdesk_client import get_freshdesk_client

logger = structlog.get_logger(__name__)


async def hitl_node(state: TicketState) -> dict:
    """
    Pauses the graph and waits for human approval.
    The interrupt() call suspends execution — the graph checkpoint
    is saved in PostgreSQL/Supabase and resumes when the user responds.
    """
    pending = state.get("pending_action", {})
    logger.info("hitl_node.interrupt_called", action_type=pending.get("type"))

    # ── Graph pauses here ─────────────────────────────────────────────────────
    # The interrupt() payload is sent to the frontend via the API response.
    user_decision = interrupt({
        "type": "approval_required",
        "action": pending,
        "message": pending.get("message", "Bobby wants to take an action. Do you approve?"),
    })
    # ── Graph resumes here after user responds ────────────────────────────────

    approved = user_decision.get("approved", False)
    logger.info("hitl_node.decision", approved=approved)

    return {
        "human_approved": approved,
        "needs_human_approval": False,
    }


async def execute_action_node(state: TicketState) -> dict:
    """
    Executes the approved action.
    Only reached after HITL approval (human_approved=True).
    """
    pending = state.get("pending_action", {})
    action_type = pending.get("type")

    logger.info("execute_action_node.start", action_type=action_type)

    if action_type == "create_ticket":
        try:
            freshdesk = get_freshdesk_client()
            ticket_data = pending.get("data", {})
            created = await freshdesk.create_ticket(
                subject=ticket_data["subject"],
                description=ticket_data["description"],
                category=ticket_data["category"],
                priority=ticket_data["priority"],
                requester_id=state["user_id"],
            )
            ticket_id = created.get("id")
            logger.info("execute_action_node.ticket_created", ticket_id=ticket_id)
            return {
                "ticket_id": str(ticket_id),
                "final_response": (
                    f"✅ Your ticket has been created!\n\n"
                    f"**Ticket #{ticket_id}** — {ticket_data['subject']}\n\n"
                    f"You can track its status in My Tickets."
                ),
            }
        except Exception as e:
            logger.error("execute_action_node.create_error", error=str(e))
            return {
                "error": str(e),
                "final_response": "Sorry, I could not create the ticket. Please try again or contact the helpdesk.",
            }

    # ── Stub for account actions (Graph API creds not available for demo) ─────
    if action_type in ("account_unlock", "password_reset"):
        return {
            "final_response": (
                f"⚠️ {action_type.replace('_', ' ').title()} is being processed. "
                "A helpdesk agent will contact you shortly."
            ),
        }

    return {"final_response": "Action completed."}


async def cancelled_node(state: TicketState) -> dict:
    """Called when user rejects the HITL approval."""
    logger.info("cancelled_node.action_cancelled")
    return {
        "final_response": "Okay, I've cancelled that action. Is there anything else I can help you with?",
    }


def route_after_hitl(state: TicketState) -> str:
    """Route based on human decision after HITL."""
    if state.get("human_approved"):
        return "execute_action_node"
    return "cancelled_node"
