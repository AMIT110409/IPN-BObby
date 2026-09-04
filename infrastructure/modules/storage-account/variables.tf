variable "name" {
  description = "Storage account name (3-24 lowercase alphanumeric, globally unique)."
  type        = string
  validation {
    condition     = length(var.name) >= 3 && length(var.name) <= 24
    error_message = "Storage account name must be 3-24 characters."
  }
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "environment" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
