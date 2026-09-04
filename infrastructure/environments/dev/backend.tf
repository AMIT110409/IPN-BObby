###############################################################################
# DEV Environment — Terraform Backend Configuration
#
# BEFORE FIRST USE: Run bootstrap/bootstrap.sh to create this storage account.
# Then run: terraform init -backend-config=backend.tf
###############################################################################

terraform {
  backend "azurerm" {
    resource_group_name  = "rg-bobby-tfstate"
    storage_account_name = "stbobbytfstatedev"   # created by bootstrap.sh
    container_name       = "tfstate"
    key                  = "dev/terraform.tfstate"
    use_oidc             = true                    # authenticates via GitHub OIDC — no secrets
  }
}
