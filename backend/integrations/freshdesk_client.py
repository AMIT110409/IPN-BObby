"""
Bobby — Freshdesk Client
==========================
Full async REST client for Freshdesk API v2.
Handles: auth, pagination, rate-limit backoff, field mapping.
"""
from __future__ import annotations
import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from config.settings import settings

logger = structlog.get_logger(__name__)

PRIORITY_MAP = {"low": 1, "medium": 2, "high": 3, "urgent": 4}
STATUS_MAP = {2: "Open", 3: "Pending", 4: "Resolved", 5: "Closed"}


class FreshdeskClient:
    """Async Freshdesk API v2 client."""

    def __init__(self, api_key: str, domain: str):
        self.base_url = f"https://{domain}/api/v2"
        self.auth = (api_key, "X")   # Freshdesk uses API key as username
        self.headers = {"Content-Type": "application/json"}

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(httpx.HTTPStatusError),
    )
    async def _request(self, method: str, path: str, **kwargs) -> dict | list:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.request(
                method=method,
                url=f"{self.base_url}{path}",
                auth=self.auth,
                headers=self.headers,
                **kwargs,
            )
            if response.status_code == 429:
                logger.warning("freshdesk.rate_limited")
                raise httpx.HTTPStatusError("Rate limited", request=response.request, response=response)
            response.raise_for_status()
            return response.json() if response.text else {}

    async def create_ticket(
        self,
        subject: str,
        description: str,
        category: str = "IT",
        priority: str = "medium",
        requester_id: str = "",
    ) -> dict:
        """Creates a new ticket in Freshdesk."""
        payload = {
            "subject": subject,
            "description": description,
            "priority": PRIORITY_MAP.get(priority, 2),
            "status": 2,  # Open
            "tags": ["bobby-ai", category.lower()],
        }
        if requester_id:
            payload["email"] = requester_id  # or use requester_id field

        logger.info("freshdesk.create_ticket", subject=subject)
        result = await self._request("POST", "/tickets", json=payload)
        logger.info("freshdesk.ticket_created", ticket_id=result.get("id"))
        return result

    async def get_ticket(self, ticket_id: str) -> dict:
        """Gets a single ticket by ID."""
        result = await self._request("GET", f"/tickets/{ticket_id}")
        return self._format_ticket(result)

    async def get_tickets_by_user(self, user_email: str, status: str | None = None) -> list[dict]:
        """Gets tickets for a specific user (by email)."""
        params = {"email": user_email, "per_page": 10}
        if status:
            status_code = {"open": 2, "pending": 3, "resolved": 4, "closed": 5}.get(status)
            if status_code:
                params["status"] = status_code

        results = await self._request("GET", "/tickets", params=params)
        if isinstance(results, list):
            return [self._format_ticket(t) for t in results]
        return []

    async def update_ticket(self, ticket_id: str, updates: dict) -> dict:
        """Updates a ticket."""
        return await self._request("PUT", f"/tickets/{ticket_id}", json=updates)

    async def add_note(self, ticket_id: str, body: str, private: bool = True) -> dict:
        """Adds a note/comment to a ticket."""
        return await self._request(
            "POST",
            f"/tickets/{ticket_id}/notes",
            json={"body": body, "private": private},
        )

    async def search_tickets(self, query: str) -> list[dict]:
        """Searches tickets by query string."""
        results = await self._request("GET", "/tickets/search", params={"query": f'"{query}"'})
        tickets = results.get("results", []) if isinstance(results, dict) else []
        return [self._format_ticket(t) for t in tickets]

    @staticmethod
    def _format_ticket(ticket: dict) -> dict:
        """Normalises Freshdesk ticket response."""
        return {
            "id": ticket.get("id"),
            "subject": ticket.get("subject"),
            "description": ticket.get("description_text", ""),
            "status": STATUS_MAP.get(ticket.get("status"), "Unknown"),
            "priority": ticket.get("priority"),
            "created_at": ticket.get("created_at"),
            "updated_at": ticket.get("updated_at"),
            "tags": ticket.get("tags", []),
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
_freshdesk_instance: FreshdeskClient | None = None


def get_freshdesk_client() -> FreshdeskClient:
    global _freshdesk_instance
    if _freshdesk_instance is None:
        if not settings.freshdesk_api_key or not settings.freshdesk_domain:
            raise ValueError(
                "FRESHDESK_API_KEY and FRESHDESK_DOMAIN must be set in .env"
            )
        _freshdesk_instance = FreshdeskClient(
            api_key=settings.freshdesk_api_key,
            domain=settings.freshdesk_domain,
        )
    return _freshdesk_instance
