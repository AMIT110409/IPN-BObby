output "fqdn" {
  description = "Public FQDN of the Container App (used as API base URL)."
  value       = azurerm_container_app.this.ingress[0].fqdn
}

output "identity_principal_id" {
  description = "Object ID of the managed identity — grant it permissions in other modules."
  value       = azurerm_user_assigned_identity.app.principal_id
}

output "container_app_id" {
  value = azurerm_container_app.this.id
}
