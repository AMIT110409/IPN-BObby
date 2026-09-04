###############################################################################
# MAIN (Production) Environment — Root Module
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
}

locals {
  env  = "main"
  tags = {
    project     = "bobby"
    environment = local.env
    managed_by  = "terraform"
    owner       = var.owner_team
  }
}

module "rg" {
  source      = "../../modules/resource-group"
  name        = "rg-bobby-${local.env}"
  location    = var.location
  environment = local.env
  tags        = local.tags
}

module "kv" {
  source                = "../../modules/key-vault"
  name                  = "kv-bobby-${local.env}"
  location              = module.rg.location
  resource_group_name   = module.rg.name
  tenant_id             = var.tenant_id
  deployer_principal_id = var.deployer_principal_id
  tags                  = local.tags
}

module "storage" {
  source              = "../../modules/storage-account"
  name                = "stbobbyapp${local.env}"
  resource_group_name = module.rg.name
  location            = module.rg.location
  environment         = local.env
  tags                = local.tags
}

resource "azurerm_log_analytics_workspace" "this" {
  name                = "law-bobby-${local.env}"
  location            = module.rg.location
  resource_group_name = module.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 90      # longer retention in prod
  tags                = local.tags
}

module "app" {
  source                     = "../../modules/container-app"
  name                       = "ca-bobby-${local.env}"
  location                   = module.rg.location
  resource_group_name        = module.rg.name
  key_vault_id               = module.kv.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.this.id
  container_image            = var.container_image
  min_replicas               = 2     # always-on in prod
  max_replicas               = 5
  tags                       = local.tags

  env_vars = [
    { name = "APP_ENV",   value = "production" },
    { name = "LOG_LEVEL", value = "info" },
  ]
}
