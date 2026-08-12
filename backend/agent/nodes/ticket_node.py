"""
Bobby — Ticket Node
====================
Handles: create_ticket, ticket_status intents.
Uses Freshdesk API to create or look up tickets.
Write operations go through HITL approval before executing.
"""
from __future__ import annotations
import json
import structlog
from langchain_core.messages import SystemMessage, HumanMessage
from agent.state import TicketState
from integrations.llm_client import get_llm
from integrations.freshdesk_client import get_freshdesk_client

logger = structlog.get_logger(__name__)

SLOT_FILLING_PROMPT = """You are Bobby, an IT helpdesk AI assistant.
Extract the following fields from the user's message to create a support ticket.
Return a JSON object. If a field is missing, set it to null.

Fields:
- subject: Short description of the issue (string)
- description: Detailed description (string)  
- category: One of ["IT", "HR", "Finance", "General"] (string)
- priority: One of ["low", "medium", "high", "urgent"] (string, default "medium")

User message: {message}

Return ONLY valid JSON, no extra text.
"""


async def ticket_node(state: TicketState) -> dict:
    """
    Handles ticket creation and status lookup.
    For CREATE: extracts fields via LLM, then triggers HITL.
    For STATUS: looks up ticket directly (no HITL needed).
    """
    logger.info("ticket_node.start", intent=state.get("intent"))

    intent = state.get("intent")
    user_message = state["messages"][-1].content

    # ── Ticket Status Lookup (no HITL, read-only) ─────────────────────────────
    if intent == "ticket_status":
        try:
            freshdesk = get_freshdesk_client()
            tickets = await freshdesk.get_tickets_by_user(state["user_id"])
            if tickets:
                ticket_summary = "\n".join([
                    f"• Ticket #{t['id']}: {t['subject']} — Status: {t['status']}"
                    for t in tickets[:5]
                ])
                return {
                    "ticket_details": {"tickets": tickets},
                    "final_response": f"Here are your open tickets:\n\n{ticket_summary}",
                }
            return {
                "final_response": "You don't have any open tickets at the moment.",
            }
        except Exception as e:
            logger.error("ticket_node.status_error", error=str(e))
            return {"error": str(e), "escalated": True, "escalation_reason": "Could not fetch tickets"}

    # ── Ticket Creation (needs HITL approval) ─────────────────────────────────
    llm = get_llm(json_mode=True)
    try:
        response = await llm.ainvoke([
            SystemMessage(content=SLOT_FILLING_PROMPT.format(message=user_message)),
        ])
        ticket_fields = json.loads(response.content)
    except Exception as e:
        logger.error("ticket_node.slot_fill_error", error=str(e))
        return {"error": str(e), "escalated": True, "escalation_reason": "Could not extract ticket details"}

    # Build proposed ticket
    proposed_ticket = {
        "subject":     ticket_fields.get("subject", "IT Support Request"),
        "description": ticket_fields.get("description", user_message),
        "category":    ticket_fields.get("category", "IT"),
        "priority":    ticket_fields.get("priority", "medium"),
        "requester_id": state["user_id"],
    }

    logger.info("ticket_node.proposed", subject=proposed_ticket["subject"])

    # Trigger HITL — graph will pause here until user approves/rejects
    return {
        "proposed_ticket": proposed_ticket,
        "needs_human_approval": True,
        "pending_action": {
            "type": "create_ticket",
            "data": proposed_ticket,
            "message": f"Bobby wants to create this ticket:\n\n**{proposed_ticket['subject']}**\n\n{proposed_ticket['description']}\n\nCategory: {proposed_ticket['category']} | Priority: {proposed_ticket['priority']}",
        },
    }


def route_after_ticket(state: TicketState) -> str:
    """Route to HITL if approval needed, response if status lookup."""
    if state.get("needs_human_approval"):
        return "hitl_node"
    if state.get("escalated"):
        return "escalation_node"
    return "response_node"
