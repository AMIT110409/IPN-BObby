"""
Bobby — Triage Node (Intent Classifier)
========================================
This is the FIRST node in the Bobby graph.
It classifies the user's message into one of the defined intents
and sets the confidence score.

Routing decision is made AFTER this node based on state["intent"].
"""
from __future__ import annotations
import json
import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from agent.state import TicketState
from integrations.llm_client import get_llm

logger = structlog.get_logger(__name__)

# ── Intent categories ─────────────────────────────────────────────────────────
VALID_INTENTS = {
    "it_question",       # user wants to know how to do something (→ RAG)
    "create_ticket",     # user wants to report an issue or request
    "ticket_status",     # user wants to check their ticket status
    "account_unlock",    # user's account is locked
    "password_reset",    # user wants to reset their password
    "out_of_scope",      # not an IT service management request
}

TRIAGE_SYSTEM_PROMPT = """You are Bobby, an AI assistant for IT service management.
Your job is to classify the user's message into EXACTLY ONE of these intents:

- it_question       : User wants to know how to do something or get information
- create_ticket     : User is reporting a problem or making a service request  
- ticket_status     : User wants to check the status of an existing ticket
- account_unlock    : User's account is locked and they cannot log in
- password_reset    : User wants to reset or change their password
- out_of_scope      : Request is not related to IT service management

Rules:
1. Choose ONLY from the list above
2. Return a JSON object with "intent" and "confidence" (0.0–1.0) and "reason"
3. If confidence < 0.6, use "out_of_scope"

Return format (JSON only, no extra text):
{
  "intent": "it_question",
  "confidence": 0.92,
  "reason": "User is asking how to connect to the VPN"
}
"""


async def triage_node(state: TicketState) -> dict:
    """Classifies user intent from the latest message."""
    logger.info("triage_node.start", user_id=state.get("user_id"))

    last_message = state["messages"][-1].content if state["messages"] else ""

    llm = get_llm(json_mode=True)

    try:
        response = await llm.ainvoke([
            SystemMessage(content=TRIAGE_SYSTEM_PROMPT),
            HumanMessage(content=f"User message: {last_message}")
        ])

        parsed = json.loads(response.content)
        intent = parsed.get("intent", "out_of_scope")
        confidence = float(parsed.get("confidence", 0.0))

        # Safety check — only accept valid intents
        if intent not in VALID_INTENTS:
            intent = "out_of_scope"
            confidence = 0.0

        logger.info(
            "triage_node.complete",
            intent=intent,
            confidence=confidence,
            user_id=state.get("user_id")
        )

        return {
            "intent": intent,
            "confidence": confidence,
            "raw_intent_response": response.content,
        }

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.error("triage_node.parse_error", error=str(e))
        return {
            "intent": "out_of_scope",
            "confidence": 0.0,
            "raw_intent_response": "",
            "error": f"Triage parse error: {e}",
        }


def route_after_triage(state: TicketState) -> str:
    """
    Edge function: decides next node after triage.
    Called by the graph as a conditional edge.
    """
    intent = state.get("intent", "out_of_scope")
    confidence = state.get("confidence", 0.0)

    # Low confidence → escalate
    if confidence < 0.6:
        return "escalation_node"

    routes = {
        "it_question":    "knowledge_node",
        "create_ticket":  "ticket_node",
        "ticket_status":  "ticket_node",
        "account_unlock": "account_node",
        "password_reset": "account_node",
        "out_of_scope":   "escalation_node",
    }
    return routes.get(intent, "escalation_node")
