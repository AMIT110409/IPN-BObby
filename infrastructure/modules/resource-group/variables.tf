variable "name" {
  description = "Name of the resource group."
  type        = string
}

variable "location" {
  description = "Azure region (e.g. westeurope)."
  type        = string
}

variable "environment" {
  description = "Environment name (dev | main)."
  type        = string
  validation {
    condition     = contains(["dev", "main"], var.environment)
    error_message = "Environment must be 'dev' or 'main'."
  }
}

variable "tags" {
  description = "Additional tags to merge."
  type        = map(string)
  default     = {}
}
