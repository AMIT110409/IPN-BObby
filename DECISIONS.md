# Bobby — Architectural Decision Log (ADL)

> **Purpose:** Every significant technical decision made during this project is recorded here.
> Developers must add an entry whenever they:
> - Choose between two or more approaches
> - Deviate from the documented architecture
> - Make a trade-off (speed vs correctness, cost vs features, etc.)
> - Change a previously made decision
>
> **Format:** Add new entries at the TOP of the list. Oldest entries at the bottom.

---

## Decision Template

```
## [DEC-###] Title
**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded by DEC-XXX  
**Decided by:** [Name / Team]

### Context
What is the situation or problem that requires a decision?

### Decision
What was decided?

### Alternatives Considered
- Option A: description + why rejected
- Option B: description + why rejected

### Consequences
- ✅ Positive consequences
- ⚠️ Trade-offs or risks
```

---

## Decision Log

---

## [DEC-010] Use MemorySaver for Phase 1 demo; migrate to PostgresSaver for production
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
LangGraph requires a checkpointer to persist graph state across HITL interrupts. Two options:
1. `MemorySaver` — in-memory, no external dependency
2. `PostgresSaver` — persists to PostgreSQL, survives restarts

### Decision
Use `MemorySaver` for the Phase 1 demo. The demo runs in a single process and sessions are short-lived. Switch to `PostgresSaver` with Supabase PostgreSQL for production.

### Alternatives Considered
- `PostgresSaver` from day 1: correct but adds complexity before demo is even working

### Consequences
- ✅ Faster demo setup, no DB migrations needed for Phase 1
- ⚠️ Demo sessions lost on server restart — acceptable for demo
- ⚠️ Must be replaced before production — tracked in backlog

---

## [DEC-009] DashboardPage only accessible to helpdesk and admin roles
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
The architecture defines 3 roles: employee, helpdesk, IT admin. The dashboard (ticket list view) is not relevant for employees — they use the chat.

### Decision
RoleGuard hides the Dashboard nav link and redirects employees to /chat if they navigate to /dashboard directly.

### Alternatives Considered
- Show dashboard to all: Simpler code, but employees see helpdesk data — not appropriate

### Consequences
- ✅ Clean UX — each role sees only what they need
- ⚠️ Role enforcement on backend APIs is still needed (not just frontend routing)

---

## [DEC-008] Use CSS Modules (not Tailwind) for styling
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
Need a styling approach for the React frontend that is maintainable across a team.

### Decision
Use CSS Modules with CSS custom properties (design tokens). Each component has its own `.module.css` file.

### Alternatives Considered
- Tailwind CSS: fast to prototype but verbose in JSX, harder to match Figma precisely
- Styled-components: extra runtime overhead, slower for team unfamiliar with CSS-in-JS

### Consequences
- ✅ Clean separation of styles from logic
- ✅ No build-time dependencies beyond Vite's built-in CSS Modules support
- ⚠️ More files per component — acceptable trade-off for clarity

---

## [DEC-007] interrupt_before=["hitl_node"] for HITL (not interrupt_after)
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
LangGraph supports interrupting BEFORE or AFTER a node. For human approval, we need to pause before any action is taken.

### Decision
Use `interrupt_before=["hitl_node"]` in the graph compile step. The `hitl_node` then uses `interrupt()` internally to receive the user decision when the graph resumes.

### Alternatives Considered
- `interrupt_after`: Pauses after the node has already run — too late for approval

### Consequences
- ✅ No action is taken until user explicitly approves
- ✅ Standard LangGraph HITL pattern — well-documented

---

## [DEC-006] In-memory fallback search for dev without Supabase credentials
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
Developers need to run the system locally without setting up Supabase or Azure AI Search.

### Decision
`search_client.py` falls back to `InMemorySearchClient` when no Supabase or Azure credentials are set. This contains 3 hardcoded mock KB articles for demo purposes.

### Alternatives Considered
- Require Supabase always: blocks local development without credentials

### Consequences
- ✅ Zero-config local development
- ⚠️ Mock articles are not representative of production knowledge base — clearly documented

---

## [DEC-005] CQRS: Commands route through LangGraph, Queries bypass it
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
All operations were initially considered to go through LangGraph. This would mean reading a ticket list triggers an LLM call — slow and expensive.

### Decision
Separate all operations into:
- **Commands** (`/commands/*`) — write operations, go through LangGraph + HITL
- **Queries** (`/queries/*`) — read operations, bypass LangGraph entirely, call Freshdesk/DB directly

### Alternatives Considered
- Everything through LangGraph: Simple router but LLM cost for every read operation
- Full CQRS with event sourcing: Over-engineered for MVP

### Consequences
- ✅ Read operations return in ~200ms instead of 2-4 seconds
- ✅ No LLM cost for reads
- ✅ Clear separation makes testing much easier
- ⚠️ Developers must know which endpoint type to use — documented in DEVELOPER_GUIDE.md

---

## [DEC-004] Single LangGraph agent (not multi-agent supervisor pattern)
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Manager + Tech Lead

### Context
Architecture offers two options: single agent with internal routing, or multi-agent supervisor pattern.

### Decision
Use a single Bobby graph with conditional routing nodes. Sub-graphs (ticket, account, knowledge) are implemented as nodes within the same graph, not as separate agent graphs called by a supervisor.

### Alternatives Considered
- Multi-agent supervisor: Correct for complex cross-domain orchestration but over-engineered for Bobby's current use cases

### Consequences
- ✅ Simpler graph, easier to debug and trace in Langfuse
- ✅ Single checkpoint, single state — simpler HITL
- ⚠️ If use case complexity grows significantly, may need to re-evaluate — tracked as future decision point

---

## [DEC-003] Mock auth (JWT + demo users) for Phase 1; Entra ID for production
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Tech Lead

### Context
Real Entra ID SSO requires Azure app registration, JWKS endpoint, and MSAL setup. For the demo, this is unnecessary overhead.

### Decision
Phase 1 uses a simple role-selector login screen and JWT tokens signed with `API_SECRET_KEY`. The middleware is designed to be swapped for Entra ID JWKS validation with minimal changes.

### Alternatives Considered
- Entra ID from day 1: Correct but blocks demo setup by several days

### Consequences
- ✅ Demo works without Azure tenant setup
- ⚠️ NOT safe for production — must be replaced before client handover
- ⚠️ `API_SECRET_KEY` must be changed from default before any shared deployment

---

## [DEC-002] Freshdesk (not Freshservice) as ITSM platform
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Client + Manager

### Context
Client uses Freshdesk for ticket management. Freshservice is a different product with a different API.

### Decision
All ticket operations use the Freshdesk REST API v2. The client is responsible for providing a sandbox instance and API key.

### Alternatives Considered
- Freshservice: Different API schema, different ticket fields — not applicable for this client

### Consequences
- ✅ Direct integration with client's existing tool
- ⚠️ Freshdesk plan tier determines API rate limits — confirm with client (see Assumption 140)

---

## [DEC-001] Python + LangGraph + FastAPI as core tech stack
**Date:** 2026-08-12  
**Status:** Accepted  
**Decided by:** Manager

### Context
Manager specified Python and LangGraph as the required technologies. FastAPI was chosen as the API layer.

### Decision
- **Language:** Python 3.10+
- **Agent framework:** LangGraph 0.2+
- **API layer:** FastAPI (async)
- **Frontend:** React + TypeScript + Vite

### Alternatives Considered
- Node.js backend: Manager specified Python
- LangChain only (no LangGraph): LangGraph adds stateful graph + HITL, essential for Bobby

### Consequences
- ✅ Aligns with team expertise and manager direction
- ✅ LangGraph HITL (interrupt()) is production-grade
- ✅ FastAPI async model matches LangGraph's async design perfectly
