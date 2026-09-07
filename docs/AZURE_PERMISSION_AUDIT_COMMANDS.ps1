# ═══════════════════════════════════════════════════════════════════
# AZURE PERMISSION AUDIT — Complete Command Toolkit
# Use this whenever you join a new project or need to check access
# ═══════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────
# STEP 1: LOGIN CHECK
# "Kaun sa account logged in hai? Kaun sa subscription active hai?"
# ─────────────────────────────────────────────────────────────────

# Basic: who am I and which subscription
az account show

# Clean JSON format (easier to read)
az account show --query "{
  subscription: name,
  subscriptionId: id,
  tenantId: tenantId,
  loggedInAs: user.name,
  userType: user.type
}" -o json

# All subscriptions you have access to
az account list --query "[].{name:name, id:id, state:state}" -o table

# Switch to a specific subscription
az account set --subscription "1dc5a1b6-be7f-4d5e-8c22-0f835b73800e"


# ─────────────────────────────────────────────────────────────────
# STEP 2: SUBSCRIPTION RBAC ROLES CHECK
# "Mujhe subscription pe kaunse roles diye gaye hain?"
# ─────────────────────────────────────────────────────────────────

# All roles assigned to YOUR account (most important command)
az role assignment list \
  --assignee "a.rathore@ofiservices.com" \
  --all \
  --query "[].{Role:roleDefinitionName, Scope:scope}" \
  -o table

# Same but for a specific subscription only
az role assignment list \
  --assignee "a.rathore@ofiservices.com" \
  --scope "/subscriptions/1dc5a1b6-be7f-4d5e-8c22-0f835b73800e" \
  --query "[].{Role:roleDefinitionName, Scope:scope}" \
  -o table

# Check roles for a specific resource group
az role assignment list \
  --assignee "a.rathore@ofiservices.com" \
  --resource-group "rg-bobby-dev" \
  --query "[].{Role:roleDefinitionName}" \
  -o table


# ─────────────────────────────────────────────────────────────────
# STEP 3: AZURE AD USER INFO
# "Mera Object ID kya hai? (role assign karne ke liye chahiye)"
# ─────────────────────────────────────────────────────────────────

# Your own user details (name + Object ID)
az ad user show \
  --id "a.rathore@ofiservices.com" \
  --query "{name:displayName, objectId:id, email:userPrincipalName}" \
  -o json

# Someone else ka check karna ho
az ad user show \
  --id "someone@ofiservices.com" \
  --query "{name:displayName, objectId:id}" \
  -o json


# ─────────────────────────────────────────────────────────────────
# STEP 4: AZURE AD DIRECTORY ROLES CHECK
# "Mujhe Azure AD mein kaunsi roles hain? (Application Developer, etc.)"
# ─────────────────────────────────────────────────────────────────

# Your Azure AD directory roles (NOT subscription roles — different!)
az rest \
  --method GET \
  --url "https://graph.microsoft.com/v1.0/me/transitiveMemberOf/microsoft.graph.directoryRole?$select=displayName,description" \
  --query "value[].displayName" \
  -o json

# Result: [] means NO directory roles assigned
# Result: ["Application Developer"] means you have it


# ─────────────────────────────────────────────────────────────────
# STEP 5: GROUP MEMBERSHIPS CHECK
# "Main kaun kaun se Azure AD groups mein hoon?"
# ─────────────────────────────────────────────────────────────────

az rest \
  --method GET \
  --url "https://graph.microsoft.com/v1.0/me/memberOf?$select=displayName,id" \
  --query "value[].displayName" \
  -o json


# ─────────────────────────────────────────────────────────────────
# STEP 6: TENANT POLICY CHECK
# "Kya mujhe App Registration create karne ki permission hai?"
# (This is different from RBAC roles — it's a tenant-wide policy)
# ─────────────────────────────────────────────────────────────────

az rest \
  --method GET \
  --url "https://graph.microsoft.com/v1.0/policies/authorizationPolicy" \
  --query "{
    canUsersCreateApps: defaultUserRolePermissions.allowedToCreateApps,
    canUsersCreateTenants: defaultUserRolePermissions.allowedToCreateTenants,
    canUsersReadOtherUsers: defaultUserRolePermissions.allowedToReadOtherUsers
  }" \
  -o json

# Result explanation:
# "canUsersCreateApps": true  = you CAN create App Registrations
# "canUsersCreateApps": false = BLOCKED by admin — need Application Developer role


# ─────────────────────────────────────────────────────────────────
# STEP 7: RESOURCE PROVIDERS CHECK
# "Kya zaroori Azure services enabled hain mere subscription mein?"
# ─────────────────────────────────────────────────────────────────

# Check one provider
az provider show \
  --namespace Microsoft.App \
  --query "{provider:namespace, state:registrationState}" \
  -o json

# Check all Bobby-related providers at once
$providers = @(
  "Microsoft.App",           # Container Apps (Bobby runs here)
  "Microsoft.KeyVault",      # Key Vault (secrets storage)
  "Microsoft.Storage",       # Storage Accounts (Terraform state)
  "Microsoft.ContainerRegistry", # Docker image registry
  "Microsoft.OperationalInsights", # Log Analytics
  "Microsoft.ManagedIdentity",    # Managed Identity
  "Microsoft.Authorization"       # RBAC assignments
)

foreach ($p in $providers) {
  az provider show --namespace $p --query "{provider:namespace, state:registrationState}" -o json
}

# State meanings:
# "Registered"     = ✅ Ready to use
# "NotRegistered"  = ❌ Need to register (run next command)
# "Registering"    = 🔄 In progress


# ─────────────────────────────────────────────────────────────────
# STEP 8: REGISTER PROVIDERS (if NotRegistered)
# "Contributor access hai toh khud register kar sakte ho"
# ─────────────────────────────────────────────────────────────────

az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.KeyVault
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.ManagedIdentity
az provider register --namespace Microsoft.Authorization

# Then wait and verify:
az provider show --namespace Microsoft.App --query "registrationState" -o tsv
# Keep running until it says "Registered" (~2-5 minutes)


# ─────────────────────────────────────────────────────────────────
# STEP 9: KEY VAULT ACCESS CHECK (if Key Vault exists)
# "Kya mujhe Key Vault pe secrets read/write kar sakta hoon?"
# ─────────────────────────────────────────────────────────────────

# List your KV role assignments
az role assignment list \
  --assignee "a.rathore@ofiservices.com" \
  --scope "/subscriptions/1dc5a1b6-be7f-4d5e-8c22-0f835b73800e/resourceGroups/rg-bobby-dev/providers/Microsoft.KeyVault/vaults/kv-bobby-dev" \
  --query "[].{Role:roleDefinitionName}" \
  -o table

# Roles that matter for Key Vault:
# "Key Vault Administrator"   = full access (dev/admin)
# "Key Vault Secrets User"    = read only (app/service)
# "Key Vault Secrets Officer" = read+write secrets (CI/CD)


# ─────────────────────────────────────────────────────────────────
# STEP 10: STORAGE ACCOUNT ACCESS CHECK
# "Kya mujhe blobs read/write kar sakta hoon?"
# ─────────────────────────────────────────────────────────────────

az role assignment list \
  --assignee "a.rathore@ofiservices.com" \
  --scope "/subscriptions/1dc5a1b6-be7f-4d5e-8c22-0f835b73800e" \
  --query "[?contains(roleDefinitionName,'Storage')].{Role:roleDefinitionName, Scope:scope}" \
  -o table

# Roles that matter for Storage:
# "Storage Blob Data Contributor"  = read+write blobs (CI/CD needs this)
# "Storage Blob Data Reader"       = read only
# "Storage Account Contributor"    = manage account (not data)


# ─────────────────────────────────────────────────────────────────
# QUICK FULL AUDIT — ONE COMMAND TO RUN ALL CHECKS
# Copy this entire block and paste in PowerShell
# ─────────────────────────────────────────────────────────────────

Write-Host "========== AZURE PERMISSION AUDIT ==========" -ForegroundColor Cyan

Write-Host "`n[1] LOGGED IN AS:" -ForegroundColor Yellow
az account show --query "{user:user.name, subscription:name, subscriptionId:id}" -o json

Write-Host "`n[2] SUBSCRIPTION RBAC ROLES:" -ForegroundColor Yellow
az role assignment list --assignee "a.rathore@ofiservices.com" --all --query "[].{Role:roleDefinitionName, Scope:scope}" -o table

Write-Host "`n[3] AZURE AD DIRECTORY ROLES:" -ForegroundColor Yellow
az rest --method GET --url "https://graph.microsoft.com/v1.0/me/transitiveMemberOf/microsoft.graph.directoryRole?`$select=displayName" --query "value[].displayName" -o json

Write-Host "`n[4] TENANT POLICY (can create apps?):" -ForegroundColor Yellow
az rest --method GET --url "https://graph.microsoft.com/v1.0/policies/authorizationPolicy" --query "defaultUserRolePermissions.allowedToCreateApps" -o json

Write-Host "`n[5] RESOURCE PROVIDERS:" -ForegroundColor Yellow
az provider show --namespace Microsoft.App --query "{provider:namespace, state:registrationState}" -o json
az provider show --namespace Microsoft.KeyVault --query "{provider:namespace, state:registrationState}" -o json
az provider show --namespace Microsoft.Storage --query "{provider:namespace, state:registrationState}" -o json

Write-Host "`n========== AUDIT COMPLETE ==========" -ForegroundColor Cyan


# ─────────────────────────────────────────────────────────────────
# DIFFERENCE CHEATSHEET: Subscription RBAC vs Azure AD Roles
# Bahut log confuse hote hain — yeh clearly samjho
# ─────────────────────────────────────────────────────────────────

# SUBSCRIPTION RBAC ROLES (az role assignment list)
# ─────────────────────────────────────────────────
# Controls: WHO can do WHAT with Azure RESOURCES
# Examples:
#   Contributor           = create/modify/delete Azure resources
#   Reader                = only view resources
#   Storage Blob Data Contributor = read/write blob data
#   Key Vault Administrator       = manage Key Vault
#   User Access Administrator     = assign roles to others
#
# Check: az role assignment list --assignee <email> --all

# AZURE AD DIRECTORY ROLES (az rest > graph.microsoft.com)
# ─────────────────────────────────────────────────────────
# Controls: WHO can manage AZURE AD itself
# Examples:
#   Global Administrator  = God mode (avoid!)
#   Application Developer = create App Registrations
#   Application Administrator = manage all apps
#   User Administrator    = manage users
#
# Check: az rest --url "https://graph.microsoft.com/v1.0/me/transitiveMemberOf/microsoft.graph.directoryRole"

# TENANT POLICY (az rest > authorizationPolicy)
# ─────────────────────────────────────────────
# Controls: DEFAULT permissions for ALL users in the tenant
# Even if you have no role, this policy gives base permissions
# allowedToCreateApps: true/false
#
# Check: az rest --url "https://graph.microsoft.com/v1.0/policies/authorizationPolicy"
