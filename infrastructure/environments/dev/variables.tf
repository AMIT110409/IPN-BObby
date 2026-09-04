variable "location" {
  description = "Azure region for all resources (e.g. westeurope)."
  type        = string
}

variable "tenant_id" {
  description = "Azure AD Tenant ID — injected from GitHub secret ARM_TENANT_ID."
  type        = string
  sensitive   = true
}

variable "deployer_principal_id" {
  description = "Object ID of the OIDC service principal used by GitHub Actions."
  type        = string
  sensitive   = true
}

variable "container_image" {
  description = "Full image reference (e.g. ghcr.io/AMIT110409/IPN-BObby/bobby-backend:sha-abc)."
  type        = string
}

variable "owner_team" {
  description = "GitHub team name that owns this environment (for tagging)."
  type        = string
  default     = "bobby-devs"
}
