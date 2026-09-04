output "id" {
  value = azurerm_storage_account.this.id
}

output "name" {
  value = azurerm_storage_account.this.name
}

output "primary_connection_string" {
  description = "Store in Key Vault — do NOT use directly in app settings."
  value       = azurerm_storage_account.this.primary_connection_string
  sensitive   = true
}
