###############################################################################
# MAIN (Production) Environment — Terraform Backend
###############################################################################

terraform {
  backend "azurerm" {
    resource_group_name  = "rg-bobby-tfstate"
    storage_account_name = "stbobbytfstatemain"   # created by bootstrap.sh
    container_name       = "tfstate"
    key                  = "main/terraform.tfstate"
    use_oidc             = true
  }
}
