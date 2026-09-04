###############################################################################
# Storage Account Module
# Creates an Azure Storage Account with versioning + soft delete enabled.
# Used for blob storage, not for Terraform state (state has its own account).
###############################################################################

resource "azurerm_storage_account" "this" {
  name                     = var.name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "main" ? "GRS" : "LRS"

  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = 7
    }
    container_delete_retention_policy {
      days = 7
    }
  }

  tags = var.tags
}
