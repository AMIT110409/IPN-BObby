variable "name" {
  description = "Key Vault name (3-24 chars, globally unique)."
  type        = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "tenant_id" {
  description = "Azure AD tenant ID."
  type        = string
  sensitive   = true
}

variable "deployer_principal_id" {
  description = "Object ID of the OIDC service principal that deploys."
  type        = string
  sensitive   = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
