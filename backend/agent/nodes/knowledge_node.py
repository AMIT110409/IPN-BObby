"""
Bobby — Knowledge Retrieval Node (RAG)
=======================================
Searches the knowledge base (Supabase pgvector or Azure AI Search)
and synthesises an answer with citations.
"""
from __future__ import annotations
import structlog
from langchain_core.messages import SystemMessage, HumanMessage
from agent.state import TicketState
from integrations.llm_client import get_llm
from integrations.search_client import get_search_client

logger = structlog.get_logger(__name__)

SYNTHESIS_PROMPT = """You are Bobby, an IT helpdesk AI assistant.
Use the retrieved knowledge base articles below to answer the user's question.

Rules:
1. Answer in clear, simple English
2. If the answer is in the docs, cite which document (use [Source: doc_name])
3. If you are not confident, say so and offer to escalate
4. Keep answers concise — maximum 4 sentences
5. Do NOT make up information not in the retrieved docs

Retrieved Knowledge Base Articles:
{context}
"""


async def knowledge_node(state: TicketState) -> dict:
    """Retrieves relevant KB articles and synthesises an answer."""
    logger.info("knowledge_node.start", user_id=state.get("user_id"))

    user_query = state["messages"][-1].content
    search_client = get_search_client()

    # ── Step 1: Retrieve relevant documents ───────────────────────────────────
    try:
        docs = await search_client.search(query=user_query, top_k=5)
    except Exception as e:
        logger.error("knowledge_node.search_error", error=str(e))
        docs = []

    if not docs:
        return {
            "retrieved_docs": [],
            "knowledge_answer": "",
            "escalated": True,
            "escalation_reason": "No relevant knowledge base articles found",
        }

    # ── Step 2: Synthesise answer from retrieved docs ─────────────────────────
    context = "\n\n".join([
        f"[Source: {doc.get('title', 'KB Article')}]\n{doc.get('content', '')}"
        for doc in docs
    ])

    llm = get_llm()
    try:
        response = await llm.ainvoke([
            SystemMessage(content=SYNTHESIS_PROMPT.format(context=context)),
            HumanMessage(content=user_query),
        ])

        logger.info("knowledge_node.complete", docs_found=len(docs))
        return {
            "retrieved_docs": docs,
            "knowledge_answer": response.content,
            "final_response": response.content,
        }

    except Exception as e:
        logger.error("knowledge_node.llm_error", error=str(e))
        return {
            "retrieved_docs": docs,
            "knowledge_answer": "",
            "error": str(e),
            "escalated": True,
            "escalation_reason": "Failed to generate answer from knowledge base",
        }


def route_after_knowledge(state: TicketState) -> str:
    """After knowledge retrieval, go to response or escalate."""
    if state.get("escalated"):
        return "escalation_node"
    return "response_node"
