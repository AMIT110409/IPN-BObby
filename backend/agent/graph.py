"""
Bobby — Main LangGraph Graph Definition
=========================================
This file wires all nodes together into the Bobby agent graph.

Graph Flow:
  START
    ↓
  triage_node          (intent classifier)
    ↓ [route_after_triage]
    ├── knowledge_node   (RAG - for it_questions)
    ├── ticket_node      (Freshdesk - for create/status)
    ├── account_node     (Graph API - for unlock/reset)
    └── escalation_node  (low confidence → human)
         ↓
  hitl_node             (interrupt() - for write operations)
    ↓ [route_after_hitl]
    ├── execute_action_node  (approved)
    └── cancelled_node       (rejected)
         ↓
  response_node
    ↓
  END
"""
from __future__ import annotations
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from agent.state import TicketState
from agent.nodes.triage import triage_node, route_after_triage
from agent.nodes.knowledge_node import knowledge_node, route_after_knowledge
from agent.nodes.ticket_node import ticket_node, route_after_ticket
from agent.nodes.account_node import account_node
from agent.nodes.hitl_node import hitl_node, execute_action_node, cancelled_node, route_after_hitl
from agent.nodes.escalation_node import escalation_node, response_node


def build_bobby_graph(checkpointer=None):
    """
    Builds and compiles the Bobby LangGraph.

    Args:
        checkpointer: LangGraph checkpointer (MemorySaver for dev, PostgresSaver for prod)

    Returns:
        Compiled LangGraph graph
    """
    graph = StateGraph(TicketState)

    # ── Register Nodes ────────────────────────────────────────────────────────
    graph.add_node("triage_node",        triage_node)
    graph.add_node("knowledge_node",     knowledge_node)
    graph.add_node("ticket_node",        ticket_node)
    graph.add_node("account_node",       account_node)
    graph.add_node("hitl_node",          hitl_node)
    graph.add_node("execute_action_node", execute_action_node)
    graph.add_node("cancelled_node",     cancelled_node)
    graph.add_node("escalation_node",    escalation_node)
    graph.add_node("response_node",      response_node)

    # ── Entry Point ───────────────────────────────────────────────────────────
    graph.add_edge(START, "triage_node")

    # ── Conditional Routing After Triage ──────────────────────────────────────
    graph.add_conditional_edges(
        "triage_node",
        route_after_triage,
        {
            "knowledge_node":   "knowledge_node",
            "ticket_node":      "ticket_node",
            "account_node":     "account_node",
            "escalation_node":  "escalation_node",
        }
    )

    # ── After Knowledge Retrieval ─────────────────────────────────────────────
    graph.add_conditional_edges(
        "knowledge_node",
        route_after_knowledge,
        {
            "response_node":   "response_node",
            "escalation_node": "escalation_node",
        }
    )

    # ── After Ticket Node ─────────────────────────────────────────────────────
    graph.add_conditional_edges(
        "ticket_node",
        route_after_ticket,
        {
            "hitl_node":       "hitl_node",
            "escalation_node": "escalation_node",
            "response_node":   "response_node",
        }
    )

    # ── Account Node → HITL (always needs approval) ───────────────────────────
    graph.add_edge("account_node", "hitl_node")

    # ── After HITL Decision ───────────────────────────────────────────────────
    graph.add_conditional_edges(
        "hitl_node",
        route_after_hitl,
        {
            "execute_action_node": "execute_action_node",
            "cancelled_node":      "cancelled_node",
        }
    )

    # ── After Execution / Cancellation → Response ─────────────────────────────
    graph.add_edge("execute_action_node", "response_node")
    graph.add_edge("cancelled_node",      "response_node")
    graph.add_edge("escalation_node",     "response_node")

    # ── End ───────────────────────────────────────────────────────────────────
    graph.add_edge("response_node", END)

    # ── Compile with checkpointer ─────────────────────────────────────────────
    if checkpointer is None:
        checkpointer = MemorySaver()   # in-memory for dev

    return graph.compile(
        checkpointer=checkpointer,
        interrupt_before=["hitl_node"],   # pause BEFORE hitl executes
    )


# ── Singleton graph instance (created at startup) ─────────────────────────────
_graph_instance = None


def get_bobby_graph():
    """Returns the singleton compiled Bobby graph."""
    global _graph_instance
    if _graph_instance is None:
        _graph_instance = build_bobby_graph()
    return _graph_instance
