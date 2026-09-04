variable "name" {
  description = "Name prefix for the Container App and its environment."
  type        = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "key_vault_id" {
  description = "Resource ID of the Key Vault (for RBAC assignment)."
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID for Container App environment."
  type        = string
}

variable "container_image" {
  description = "Full Docker image reference (e.g. myacr.azurecr.io/bobby-backend:sha-abc123)."
  type        = string
}

variable "cpu" {
  description = "CPU cores allocated to each replica."
  type        = number
  default     = 0.5
}

variable "memory" {
  description = "Memory allocated to each replica."
  type        = string
  default     = "1.0Gi"
}

variable "min_replicas" {
  type    = number
  default = 1
}

variable "max_replicas" {
  type    = number
  default = 3
}

variable "env_vars" {
  description = "List of env var objects: { name, value? secret_name? }."
  type = list(object({
    name        = string
    value       = optional(string)
    secret_name = optional(string)
  }))
  default = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
