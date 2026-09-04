###############################################################################
# DEV Environment — Root Module
# Wires all modules together for the dev environment.
###############################################################################

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
  }
  # ARM_SUBSCRIPTION_ID, ARM_TENANT_ID, ARM_CLIENT_ID are injected
  # by GitHub Actions via OIDC — never hardcode here.
}

locals {
  env  = "dev"
  tags = {
    project     = "bobby"
    environment = local.env
    managed_by  = "terraform"
    owner       = var.owner_team
  }
}

###############################################################################
# Resource Group
###############################################################################
module "rg" {
  source      = "../../modules/resource-group"
  name        = "rg-bobby-${local.env}"
  location    = var.location
  environment = local.env
  tags        = local.tags
}

###############################################################################
# Key Vault
###############################################################################
module "kv" {
  source                = "../../modules/key-vault"
  name                  = "kv-bobby-${local.env}"
  location              = module.rg.location
  resource_group_name   = module.rg.name
  tenant_id             = var.tenant_id
  deployer_principal_id = var.deployer_principal_id
  tags                  = local.tags
}

###############################################################################
# Storage Account (app blobs — not state)
###############################################################################
module "storage" {
  source              = "../../modules/storage-account"
  name                = "stbobbyapp${local.env}"
  resource_group_name = module.rg.name
  location            = module.rg.location
  environment         = local.env
  tags                = local.tags
}

###############################################################################
# Log Analytics (needed by Container App environment)
###############################################################################
resource "azurerm_log_analytics_workspace" "this" {
  name                = "law-bobby-${local.env}"
  location            = module.rg.location
  resource_group_name = module.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

###############################################################################
# Container App (Bobby Backend)
###############################################################################
module "app" {
  source                     = "../../modules/container-app"
  name                       = "ca-bobby-${local.env}"
  location                   = module.rg.location
  resource_group_name        = module.rg.name
  key_vault_id               = module.kv.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.this.id
  container_image            = var.container_image
  min_replicas               = 1
  max_replicas               = 2
  tags                       = local.tags

  env_vars = [
    { name = "APP_ENV",    value = "dev" },
    { name = "LOG_LEVEL",  value = "debug" },
    # Secrets come from Key Vault at runtime; reference them as:
    # { name = "GOOGLE_API_KEY", secret_name = "google-api-key" }
  ]
}
