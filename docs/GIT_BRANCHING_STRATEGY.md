# Bobby ITSM — Git Branching Strategy
## Complete Guide: Feature → Release → Hotfix

> **Audience:** All engineers working on Bobby project
> **Maintained by:** Amit Rathore (a.rathore@ofiservices.com)
> **Last updated:** September 2026

---

## 1. Overview — Bobby mein 5 Types ki Branches

```
main          ──  PRODUCTION   (OFI employees yahan se Bobby use karte hain)
dev           ──  STAGING      (integration + testing ground)
feature/*     ──  FEATURE WORK (naya kaam, sirf ek engineer)
release/*     ──  RELEASE PREP (testing + version lock before going live)
hotfix/*      ──  EMERGENCY    (production mein aag lagi — turant fix)
```

---

## 2. Branch Rules — Golden Rules

| Branch | Koi seedha push kar sakta hai? | Kaise aata hai code? |
|---|---|---|
| `main` | ❌ NEVER | Sirf `release/*` ya `hotfix/*` se PR |
| `dev` | ❌ NEVER | Sirf `feature/*` se PR |
| `release/*` | ❌ NEVER | `dev` se branch kata jaata hai |
| `feature/*` | ✅ Only creator | Direct push allowed |
| `hotfix/*` | ✅ Only creator | Direct push allowed |

---

## 3. The Full Branching Picture

```
                        ┌─────────────────────────────────────────────┐
                        │               FEATURE WORK                  │
                        │   feature/new-greeting                      │
                        │   feature/ticket-priority                   │
                        │   feature/ui-dark-mode                      │
                        └──────────────┬──────────────────────────────┘
                                       │  PR → dev (reviewed + approved)
                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          DEV BRANCH                                  │
│              (Integration + QA Testing happens here)                 │
│              Auto-deploys to Azure DEV environment                   │
└──────────────────────────┬───────────────────────────────────────────┘
                           │  Release time! Cut a release branch
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    RELEASE BRANCH                                    │
│              release/v1.2.0                                          │
│              (only bug fixes — no new features!)                     │
│              UAT (User Acceptance Testing) happens here              │
└──────────┬───────────────────────────────────────────────────────────┘
           │  QA passed → PR to main (approval required)
           │  Also merge back → dev
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        MAIN BRANCH                                   │
│                    (LIVE PRODUCTION)                                 │
│              OFI employees Bobby se baat karte hain                  │
│              Auto-deploys to Azure PRODUCTION                        │
│              Git tag lagta hai: v1.2.0                               │
└──────────┬───────────────────────────────────────────────────────────┘
           │
           │  🔥 Aag lagi! Production mein critical bug!
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      HOTFIX BRANCH                                   │
│              hotfix/fix-login-crash                                  │
│              (main se seedha branch kato, turant fix karo)          │
└──────────┬───────────────────────────────────────────────────────────┘
           │  Fix ready → PR to MAIN + PR to DEV (dono mein)
           ▼
    main (patched) + dev (synced)  ✅
```

---

## 4. Feature Branch — Naya Kaam Karna

**Use karo jab:** Koi naya feature banana ho Bobby mein

### Workflow:

```bash
# Step 1: dev se fresh start
git checkout dev
git pull origin dev

# Step 2: apna branch banao
git checkout -b feature/ticket-priority-filter

# Step 3: kaam karo, commits karo
git add .
git commit -m "feat(ticket): add priority filter to ticket list"

# Step 4: push karo
git push origin feature/ticket-priority-filter

# Step 5: GitHub pe PR open karo → target: dev
# Reviewer approve kare → auto merge + auto deploy to dev Azure
```

### Naming:
```
feature/kya-banana-hai
feature/hinglish-greeting
feature/dark-mode-ui
feature/ticket-auto-close
```

---

## 5. Release Branch — Production Release Karna

**Use karo jab:** Dev mein sab theek hai, ab live karna hai

### Yeh kab banate ho?
- Sprint end pe
- Jab QA ne dev pe "All green" bol diya
- Jab client ke saath release date fix ho

### Workflow:

```bash
# Step 1: dev se release branch kato
git checkout dev
git pull origin dev
git checkout -b release/v1.2.0

# Step 2: release branch push karo (UAT yahan hoga)
git push origin release/v1.2.0
```

**Iss branch pe sirf yeh allowed hai:**
- ✅ Bug fixes (jo UAT mein mila)
- ✅ Version number update (pyproject.toml, package.json)
- ✅ Release notes likhna
- ❌ Koi naya feature NAHI
- ❌ Koi breaking change NAHI

```bash
# Step 3: agar UAT mein bug mila, release branch pe fix karo
git add .
git commit -m "fix(auth): correct session timeout on release v1.2.0"
git push origin release/v1.2.0

# Step 4: QA ne approve kiya — main mein merge karo
# GitHub pe PR open karo: release/v1.2.0 → main
# 2 seniors approve karein

# Step 5: main pe merge hone ke baad TAG lagao
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0 - Ticket priority filter + dark mode"
git push origin v1.2.0

# Step 6: dev mein bhi merge karo (jo fixes release branch pe kiye)
git checkout dev
git merge release/v1.2.0
git push origin dev

# Step 7: release branch delete karo (kaam khatam)
git push origin --delete release/v1.2.0
```

### Naming:
```
release/v1.0.0   ← first production release
release/v1.1.0   ← next sprint release
release/v1.2.0   ← next next sprint
release/v2.0.0   ← major overhaul
```

### Version Numbering (Semantic Versioning):
```
v  MAJOR  .  MINOR  .  PATCH
v    1    .    2    .    0

MAJOR = breaking change (Bobby ka pura design badla)
MINOR = new feature added (kuch naya aaya)
PATCH = bug fix only (kuch toota tha, theek kiya)
```

---

## 6. Hotfix Branch — Production Emergency Fix 🚨

**Use karo jab:** Live system mein serious bug aa gaya — users affect ho rahe hain

### Real Examples:
- Bobby crash ho raha hai login pe
- Ticket create ho raha hai but Freshdesk mein nahi ja raha
- Bobby wrong user ka data dikha raha hai (security issue!)
- API down, 500 errors aa rahe hain

### Hotfix Workflow — HAR MINUTE COUNT KARTA HAI:

```bash
# Step 1: MAIN se seedha branch kato (dev se nahi!)
# Kyun? Kyunki dev mein incomplete features ho sakte hain
git checkout main
git pull origin main
git checkout -b hotfix/fix-login-crash

# Step 2: Sirf woh fix karo jo zaroori hai — kuch extra nahi
# Code fix karo...
git add .
git commit -m "hotfix: fix null pointer crash on login when session expires"
git push origin hotfix/fix-login-crash

# Step 3: GitHub pe URGENT PR — main ki taraf
# Title mein likho: [HOTFIX] Fix login crash - URGENT
# Request immediate review

# Step 4: Ek senior approve kare (emergency mein 1 enough hai)
# main mein merge → auto-deploy → production fix! ✅

# Step 5: Naaya tag lagao
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix v1.2.1 - Fix login crash"
git push origin v1.2.1

# Step 6: Dev mein bhi merge karo (MANDATORY — warna dev outdated rahega)
git checkout dev
git merge hotfix/fix-login-crash
git push origin dev

# Step 7: Agar koi active release branch hai, wahan bhi merge karo
git checkout release/v1.3.0   # agar chal raha ho
git merge hotfix/fix-login-crash
git push origin release/v1.3.0

# Step 8: hotfix branch delete
git push origin --delete hotfix/fix-login-crash
```

### Naming:
```
hotfix/fix-login-crash
hotfix/patch-ticket-api-timeout
hotfix/security-session-leak
hotfix/fix-email-notification
```

---

## 7. Complete Branch Lifecycle — Ek Sprint ka Poora Timeline

```
WEEK 1-2: Feature Development
───────────────────────────────
Engineer A:  feature/hinglish-greeting  →  PR to dev  →  merged
Engineer B:  feature/ticket-priority    →  PR to dev  →  merged
Engineer C:  feature/dark-mode          →  PR to dev  →  merged

Dev environment pe sab features test ho rahe hain


WEEK 3: Release Preparation
───────────────────────────────
Amit: git checkout -b release/v1.2.0 from dev
QA:   Testing on release branch
Bug:  Login form mein typo mila → fix on release/v1.2.0
QA:   All tests pass ✅


WEEK 3 END: Go Live
───────────────────────────────
PR: release/v1.2.0 → main
2 seniors approve
Merge → Azure production auto-deploys
Tag: v1.2.0 created
release branch deleted

Dev pe bhi merge ho gaya


WEEK 4: Oh no! 🔥
───────────────────────────────
Monitoring alert: "Bobby returning 500 on ticket creation"
30 users affected in OFI office

Engineer:  git checkout main
           git checkout -b hotfix/fix-ticket-500
           [15 min fix]
           PR to main → 1 approval → merged
           v1.2.1 tagged
           Fix also merged to dev ✅

Total downtime: ~45 minutes
```

---

## 8. Bobby Repository — Current Status

```
GitHub: https://github.com/AMIT110409/IPN-BObby

Branches live hain:
  ✅ main   — production branch (protected hoga)
  ✅ dev    — staging branch (protected hoga)

Abhi koi bhi banana chahiye:
  feature/* — apna kaam karte waqt
  release/* — sprint end pe
  hotfix/*  — production emergency mein
```

---

## 9. Quick Decision Guide — Kaun sa Branch use karoon?

```
Mujhe kya karna hai?
        │
        ├─ Naya feature / improvement banana hai
        │   └──► feature/naam-of-feature  (from dev)
        │
        ├─ Sprint khatam, production pe bhejnaa hai
        │   └──► release/vX.Y.Z  (from dev)
        │
        ├─ Production mein bug aa gaya, users affect ho rahe hain
        │   └──► hotfix/fix-kya-tha  (from MAIN ⚠️)
        │
        └─ Kuch samajh nahi aa raha?
            └──► Amit se pehle pooch, fir karo 😄
```

---

## 10. Commit Message Format — Bobby mein yahi follow karo

```
type(scope): short description

type:
  feat     = naya feature
  fix      = bug fix
  docs     = documentation
  refactor = code restructure (no feature/fix)
  test     = test cases
  hotfix   = production emergency fix
  chore    = version bump, dependency update

scope:
  ticket   = ticket related kaam
  auth     = login/authentication
  ui       = frontend changes
  agent    = LangGraph agent
  infra    = Terraform/Azure
  api      = FastAPI endpoints

Examples:
  feat(ticket): add priority filter dropdown
  fix(auth): handle expired session gracefully
  hotfix(api): resolve 500 on ticket creation
  docs(readme): update local setup instructions
  feat(agent): improve triage confidence scoring
```

---

## 11. Branch Protection Rules (GitHub Settings mein yeh set hoga)

### `main` branch:
- ❌ Direct push allowed: **NO**
- ✅ Required PR approvals: **2**
- ✅ Required status checks: **Terraform Plan + Tests**
- ✅ Code owners review required: **YES**
- ✅ Stale approval dismiss on new commits: **YES**

### `dev` branch:
- ❌ Direct push allowed: **NO**
- ✅ Required PR approvals: **1**
- ✅ Required status checks: **Terraform Plan**
- ✅ Code owners review: **YES**

### `release/*` and `hotfix/*`:
- ✅ Creator can push directly
- PR to `main` needs 2 approvals (release) or 1 (hotfix emergency)

---

## 12. Summary Table — Ek Nazar mein Poora Strategy

| Branch | Kahan se kati jaati hai | Kahan merge hoti hai | Kab use karo |
|---|---|---|---|
| `feature/*` | `dev` | `dev` | Roz ka kaam |
| `release/*` | `dev` | `main` + `dev` | Sprint end, go-live |
| `hotfix/*` | `main` ⚠️ | `main` + `dev` + `release/*` | Production emergency |
| `dev` | — | — | Sab ka integration point |
| `main` | — | — | Only production-ready code |
