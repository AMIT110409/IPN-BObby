"""
Bobby — Search Client (Dual: Supabase pgvector / Azure AI Search)
===================================================================
Switches based on APP_ENV:
  demo       → Supabase pgvector (via REST API)
  production → Azure AI Search (hybrid vector + keyword)
"""
from __future__ import annotations
import httpx
import structlog
from config.settings import settings
from integrations.llm_client import get_embedding_model

logger = structlog.get_logger(__name__)


class SupabaseSearchClient:
    """Vector search using Supabase pgvector via RPC function."""

    def __init__(self):
        self.url = settings.supabase_url
        self.key = settings.supabase_service_role_key
        self.embedding_model = get_embedding_model()

    async def search(self, query: str, top_k: int = 5) -> list[dict]:
        # Get query embedding
        embedding = await self.embedding_model.aembed_query(query)

        # Call Supabase RPC function (match_documents)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.url}/rest/v1/rpc/match_documents",
                headers={
                    "apikey": self.key,
                    "Authorization": f"Bearer {self.key}",
                    "Content-Type": "application/json",
                },
                json={
                    "query_embedding": embedding,
                    "match_count": top_k,
                    "match_threshold": 0.7,
                },
                timeout=10.0,
            )
            if response.status_code != 200:
                logger.warning("supabase.search_failed", status=response.status_code)
                return []
            return response.json()


class AzureSearchClient:
    """Azure AI Search hybrid (vector + keyword) search."""

    def __init__(self):
        self.endpoint = settings.azure_search_endpoint
        self.api_key = settings.azure_search_api_key
        self.index = settings.azure_search_index_name
        self.embedding_model = get_embedding_model()

    async def search(self, query: str, top_k: int = 5) -> list[dict]:
        embedding = await self.embedding_model.aembed_query(query)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.endpoint}/indexes/{self.index}/docs/search?api-version=2024-05-01-preview",
                headers={
                    "api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "search": query,
                    "vectorQueries": [{
                        "kind": "vector",
                        "vector": embedding,
                        "fields": "contentVector",
                        "k": top_k,
                    }],
                    "queryType": "semantic",
                    "top": top_k,
                    "select": "title,content,source",
                },
                timeout=10.0,
            )
            if response.status_code != 200:
                logger.warning("azure_search.failed", status=response.status_code)
                return []
            data = response.json()
            return [
                {
                    "title": doc.get("title", ""),
                    "content": doc.get("content", ""),
                    "source": doc.get("source", ""),
                }
                for doc in data.get("value", [])
            ]


class InMemorySearchClient:
    """Fallback in-memory search for local dev without any external dependencies."""

    MOCK_DOCS = [
        {
            "title": "How to connect to VPN",
            "content": "To connect to the company VPN: 1. Open GlobalProtect app. 2. Enter your employee ID. 3. Authenticate with MFA. 4. Click Connect.",
            "source": "IT Knowledge Base",
        },
        {
            "title": "Password Reset Policy",
            "content": "Passwords must be at least 12 characters, include uppercase, lowercase, number and special character. Passwords expire every 90 days.",
            "source": "IT Policy",
        },
        {
            "title": "How to request new software",
            "content": "Submit a software request ticket via Bobby or the IT portal. Include the software name, business justification, and your manager approval.",
            "source": "IT Knowledge Base",
        },
    ]

    async def search(self, query: str, top_k: int = 5) -> list[dict]:
        # Simple keyword match fallback
        query_lower = query.lower()
        results = [
            doc for doc in self.MOCK_DOCS
            if any(word in doc["content"].lower() for word in query_lower.split())
        ]
        return results[:top_k] if results else self.MOCK_DOCS[:2]


# ── Factory ───────────────────────────────────────────────────────────────────
_search_instance = None


def get_search_client():
    global _search_instance
    if _search_instance is None:
        if settings.is_production and settings.azure_search_endpoint:
            _search_instance = AzureSearchClient()
        elif settings.supabase_url and settings.supabase_service_role_key:
            _search_instance = SupabaseSearchClient()
        else:
            logger.warning("search_client.using_in_memory_fallback")
            _search_instance = InMemorySearchClient()
    return _search_instance
