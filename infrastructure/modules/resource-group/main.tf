###############################################################################
# Resource Group Module
# Creates an Azure Resource Group with standard tags.
###############################################################################

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
  }
}

resource "azurerm_resource_group" "this" {
  name     = var.name
  location = var.location

  tags = merge(var.tags, {
    managed_by  = "terraform"
    environment = var.environment
  })
}
