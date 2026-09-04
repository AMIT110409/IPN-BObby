###############################################################################
# DEV terraform.tfvars — non-sensitive defaults only
# Sensitive values (tenant_id, deployer_principal_id) are NEVER stored here;
# they are injected by GitHub Actions via environment variables.
###############################################################################

location        = "westeurope"        # ← change to your actual Azure region
owner_team      = "bobby-devs"
container_image = "ghcr.io/AMIT110409/IPN-BObby/bobby-backend:latest"
