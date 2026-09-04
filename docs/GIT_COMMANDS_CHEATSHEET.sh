# Bobby — Git Branching Command Cheatsheet
# Copy-paste ready commands for every scenario
# Repo: https://github.com/AMIT110409/IPN-BObby

# ═══════════════════════════════════════════════════════════════════
# SCENARIO 1: FEATURE BRANCH → DEV
# "Mujhe naya kaam karna hai Bobby mein"
# ═══════════════════════════════════════════════════════════════════

# --- STEP 1: Hamesha dev se fresh start karo ---
git checkout dev
git pull origin dev

# --- STEP 2: Apni feature branch banao ---
git checkout -b feature/your-feature-name
# Example: git checkout -b feature/hinglish-greeting

# --- STEP 3: Kaam karo, files edit karo ---
# (apna code likhte raho...)

# --- STEP 4: Changes save karo (commit) ---
git add .
git commit -m "feat(scope): what you did"
# Example: git commit -m "feat(agent): add Hinglish greeting logic"

# Multiple commits allowed — chhote chhote karo:
git add backend/agent/nodes/triage.py
git commit -m "feat(triage): detect Hinglish intent"
git add backend/agent/nodes/knowledge_node.py
git commit -m "feat(knowledge): return Hinglish response"

# --- STEP 5: GitHub pe push karo ---
git push origin feature/your-feature-name

# --- STEP 6: GitHub pe PR open karo ---
# Browser mein jao: https://github.com/AMIT110409/IPN-BObby
# "Compare & pull request" button dikhega
# Base branch: dev  ← target yahi honi chahiye
# Title + description likho
# Reviewer assign karo (Amit)
# Submit karo

# --- STEP 7: Review ke baad merge ---
# Reviewer approve kare → GitHub pe "Merge pull request"
# Automatically Azure DEV environment pe deploy ho jaata hai ✅

# --- STEP 8: Apni branch cleanup karo ---
git checkout dev
git pull origin dev
git branch -d feature/your-feature-name           # local delete
git push origin --delete feature/your-feature-name # remote delete


# ═══════════════════════════════════════════════════════════════════
# SCENARIO 2: RELEASE BRANCH → MAIN
# "Sprint khatam, ab production pe bhejnaa hai"
# ═══════════════════════════════════════════════════════════════════

# --- STEP 1: Dev ready hai, release branch kato ---
git checkout dev
git pull origin dev
git checkout -b release/v1.2.0
git push origin release/v1.2.0

# --- STEP 2: Version number update karo ---
# backend/pyproject.toml mein version = "1.2.0" karo
git add backend/pyproject.toml
git commit -m "chore: bump version to v1.2.0"
git push origin release/v1.2.0

# --- STEP 3: QA testing karo release branch pe ---
# (testers yahan test karte hain)
# Agar bug mila:
git add .
git commit -m "fix(ui): close dropdown on outside click"
git push origin release/v1.2.0

# --- STEP 4: QA approved → PR to MAIN ---
# GitHub pe jao
# PR banao: release/v1.2.0 → main
# 2 seniors review + approve karein
# "Approve and deploy" click → production deploy ✅

# --- STEP 5: Tag lagao (version mark) ---
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0: Hinglish greeting + ticket priority filter"
git push origin v1.2.0

# --- STEP 6: Dev mein bhi merge karo (MANDATORY) ---
git checkout dev
git merge release/v1.2.0
git push origin dev

# --- STEP 7: Release branch delete karo ---
git push origin --delete release/v1.2.0
git branch -d release/v1.2.0


# ═══════════════════════════════════════════════════════════════════
# SCENARIO 3: HOTFIX → MAIN + DEV
# "Production mein aag lagi! Users affect ho rahe hain!"
# ═══════════════════════════════════════════════════════════════════

# --- STEP 1: MAIN se branch kato (dev se nahi!) ---
git checkout main
git pull origin main
git checkout -b hotfix/fix-login-crash
git push origin hotfix/fix-login-crash

# --- STEP 2: Sirf woh fix karo jo zaroori hai ---
# (minimum code change — no extras!)
git add .
git commit -m "hotfix: fix null crash on expired session login"
git push origin hotfix/fix-login-crash

# --- STEP 3: URGENT PR to MAIN ---
# GitHub pe PR banao: hotfix/fix-login-crash → main
# Title: "[HOTFIX] Fix login crash - URGENT"
# 1 senior approve kare (emergency mein 1 enough)
# Merge → production fix ✅

# --- STEP 4: Tag lagao ---
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix v1.2.1: Fix login crash"
git push origin v1.2.1

# --- STEP 5: Dev mein bhi merge karo (MANDATORY) ---
git checkout dev
git merge hotfix/fix-login-crash
git push origin dev

# --- STEP 6: Agar release branch chal rahi hai, wahan bhi ---
# git checkout release/v1.3.0
# git merge hotfix/fix-login-crash
# git push origin release/v1.3.0

# --- STEP 7: Cleanup ---
git push origin --delete hotfix/fix-login-crash
git branch -d hotfix/fix-login-crash


# ═══════════════════════════════════════════════════════════════════
# DAILY USEFUL COMMANDS
# "Roz kaam aane wale commands"
# ═══════════════════════════════════════════════════════════════════

# Dekho kaun si branch pe ho
git branch

# Sab branches dekho (local + remote)
git branch -a

# Branch switch karo
git checkout dev
git checkout feature/meri-branch

# Latest changes lo (hamesha kaam shuru karne se pehle)
git pull origin dev

# Kya changes kiye dekho (commit se pehle)
git status
git diff

# Commit history dekho
git log --oneline -10

# Ek line mein tree dekho
git log --oneline --graph --all -15

# Kisi branch ko delete karo
git branch -d branch-name           # local
git push origin --delete branch-name # remote

# Galti ho gayi? Last commit wapas lo (staged mein aa jaayega)
git reset HEAD~1

# Galti ho gayi? Sirf last commit message badlo
git commit --amend -m "correct message"


# ═══════════════════════════════════════════════════════════════════
# BRANCH NAMING QUICK REFERENCE
# ═══════════════════════════════════════════════════════════════════

# Feature branches:
# feature/hinglish-greeting
# feature/ticket-priority-filter
# feature/dark-mode-ui
# feature/auto-close-resolved-tickets

# Release branches:
# release/v1.0.0   (first launch)
# release/v1.1.0   (sprint 2)
# release/v1.2.0   (sprint 3)
# release/v2.0.0   (major version)

# Hotfix branches:
# hotfix/fix-login-crash
# hotfix/patch-ticket-api-500
# hotfix/security-session-leak

# Commit message format:
# feat(scope): description      ← naya feature
# fix(scope): description       ← bug fix
# hotfix(scope): description    ← production emergency
# docs(scope): description      ← documentation
# chore(scope): description     ← version bump, cleanup
# refactor(scope): description  ← restructure, no behavior change
# test(scope): description      ← test cases
