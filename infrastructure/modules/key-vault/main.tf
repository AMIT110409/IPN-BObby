###############################################################################
# Key Vault Module
# Creates Azure Key Vault with RBAC auth, soft-delete, and purge protection.
# Secrets are injected by CI/CD — never stored in Terraform state.
###############################################################################

resource "azurerm_key_vault" "this" {
  name                        = var.name
  location                    = var.location
  resource_group_name         = var.resource_group_name
  tenant_id                   = var.tenant_id
  sku_name                    = "standard"
  enable_rbac_authorization   = true
  soft_delete_retention_days  = 7
  purge_protection_enabled    = true

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    # In production add ip_rules or virtual_network_subnet_ids
  }

  tags = var.tags
}

# Grant the deploying identity Key Vault Administrator
resource "azurerm_role_assignment" "kv_admin" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = var.deployer_principal_id
}
