output "id" {
  value = azurerm_key_vault.this.id
}

output "name" {
  value = azurerm_key_vault.this.name
}

output "uri" {
  description = "Key Vault URI for use in app settings."
  value       = azurerm_key_vault.this.vault_uri
}
