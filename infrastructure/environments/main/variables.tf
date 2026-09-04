variable "location" {
  type = string
}

variable "tenant_id" {
  type      = string
  sensitive = true
}

variable "deployer_principal_id" {
  type      = string
  sensitive = true
}

variable "container_image" {
  type = string
}

variable "owner_team" {
  type    = string
  default = "bobby-devs"
}
