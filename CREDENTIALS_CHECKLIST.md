# Bobby — Azure & GitHub Credentials Checklist

Complete these steps **once** before running any CI/CD pipeline.
Everything after this is automated — no more manual steps ever.

---

## 1. What You Need to Find / Create

### Step 1 — Find Your Azure IDs (5 min)

Run in Azure CLI:

```bash
az login
az account show --query "{subscriptionId:id, tenantId:tenantId}" -o json
```

| Value | Where to find it | Example format |
|---|---|---|
| **Subscription ID** | `az account show` > `id` | `12345678-1234-1234-1234-123456789012` |
| **Tenant ID** | `az account show` > `tenantId` | `87654321-4321-4321-4321-210987654321` |
| **Location/Region** | Your choice | `westeurope` |

---

### Step 2 — Create an Azure AD App Registration for OIDC (10 min)

This is the identity GitHub Actions uses. No password or secret — pure OIDC.

#### In Azure Portal:
1. **Azure Active Directory > App registrations > New registration**
2. Name: `sp-bobby-github-actions`
3. Leave redirect URI blank > **Register**
4. Copy **Application (client) ID** — this becomes `ARM_CLIENT_ID`
5. Copy **Object ID** — this becomes `ARM_DEPLOYER_OBJECT_ID`

#### Add Federated Credentials (App Reg > Certificates & secrets > Federated credentials):

| Credential name | Entity | Branch/Env |
|---|---|---|
| `github-dev-branch` | Branch | `dev` |
| `github-main-branch` | Branch | `main` |
| `github-pr` | Pull Request | (any) |
| `github-env-dev` | Environment | `dev` |
| `github-env-main` | Environment | `main` |

For each: Issuer = `GitHub Actions`, Org = `AMIT110409`, Repo = `IPN-BObby`

---

### Step 3 — Grant RBAC (5 min)

```bash
SP_OBJECT_ID="<Object ID from Step 2>"
SUBSCRIPTION_ID="<your-subscription-id>"

az role assignment create \
  --assignee-object-id "${SP_OBJECT_ID}" \
  --assignee-principal-type ServicePrincipal \
  --role "Contributor" \
  --scope "/subscriptions/${SUBSCRIPTION_ID}"

az role assignment create \
  --assignee-object-id "${SP_OBJECT_ID}" \
  --assignee-principal-type ServicePrincipal \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-bobby-tfstate"
```

---

### Step 4 — Add GitHub Secrets (2 min)

Repo > **Settings > Secrets and variables > Actions > New repository secret**

| Secret name | Value |
|---|---|
| `ARM_CLIENT_ID` | Application (client) ID from Step 2 |
| `ARM_TENANT_ID` | Tenant ID from Step 1 |
| `ARM_SUBSCRIPTION_ID` | Subscription ID from Step 1 |
| `ARM_DEPLOYER_OBJECT_ID` | Object ID from Step 2 |

---

### Step 5 — Configure GitHub Environments (3 min)

Repo > **Settings > Environments**

| Environment | Required reviewers | Deployment branch |
|---|---|---|
| `dev` | None (auto-deploy) | `dev` |
| `main` | You + 1 teammate | `main` only |

Add the same 4 secrets to both environments.

---

### Step 6 — Run Bootstrap Script (5 min)

```bash
# Edit SUBSCRIPTION_ID and LOCATION in the file first
cd bobby/infrastructure/bootstrap
bash bootstrap.sh
```

Creates: `stbobbytfstatedev` and `stbobbytfstatemain` storage accounts.

---

### Step 7 — First terraform init (2 min)

```bash
cd bobby/infrastructure/environments/dev

export ARM_SUBSCRIPTION_ID="<your-subscription-id>"
export ARM_TENANT_ID="<your-tenant-id>"
export ARM_CLIENT_ID="<your-client-id>"

terraform init -backend-config=backend.tf
terraform validate
```

`Success! The configuration is valid.` means you are ready.

---

## Quick-Reference: Secrets Summary

| Secret | Purpose |
|---|---|
| `ARM_CLIENT_ID` | Which App Registration GitHub uses for OIDC |
| `ARM_TENANT_ID` | Which Azure AD tenant to authenticate against |
| `ARM_SUBSCRIPTION_ID` | Which Azure subscription to deploy into |
| `ARM_DEPLOYER_OBJECT_ID` | Object ID granted Key Vault Administrator role |

---

## Full Pipeline Flow

```
feature/* branch
     |
     v  (PR to dev)
terraform-plan.yml  --> plan posted as PR comment
     |
     v  (merged to dev)
terraform-apply-dev.yml  --> auto-apply to dev Azure resources
     |
     v  (PR dev -> main, merged)
terraform-apply-prod.yml  --> PAUSES for reviewer approval
     |  (reviewer clicks Approve)
     v
Production Azure resources updated
```

---

## Total Setup Time: ~32 minutes
