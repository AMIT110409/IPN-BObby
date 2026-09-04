#!/usr/bin/env bash
###############################################################################
# bootstrap.sh — ONE-TIME MANUAL RUN (before terraform init)
#
# Creates the Azure Storage Account that will hold Terraform remote state.
# Run this once from your local machine with Owner/Contributor access.
#
# USAGE:
#   chmod +x bootstrap.sh
#   ./bootstrap.sh
#
# PREREQUISITES:
#   az login  (or az login --tenant <TENANT_ID>)
#   az account set --subscription <SUBSCRIPTION_ID>
###############################################################################
set -euo pipefail

###############################################################################
# FILL IN THESE VALUES BEFORE RUNNING
###############################################################################
SUBSCRIPTION_ID="<YOUR_AZURE_SUBSCRIPTION_ID>"   # e.g. 12345678-...
LOCATION="westeurope"                              # e.g. westeurope
TF_STATE_RG="rg-bobby-tfstate"
TF_STATE_SA="stbobbytfstatedev"                   # 3-24 lowercase alphanum, globally unique
TF_STATE_SA_PROD="stbobbytfstatemain"             # separate account for prod state
CONTAINER_NAME="tfstate"
###############################################################################

echo "▶ Setting active subscription..."
az account set --subscription "${SUBSCRIPTION_ID}"

echo "▶ Creating resource group: ${TF_STATE_RG}..."
az group create \
  --name "${TF_STATE_RG}" \
  --location "${LOCATION}" \
  --tags managed_by=bootstrap project=bobby

echo "▶ Creating DEV state storage account: ${TF_STATE_SA}..."
az storage account create \
  --name "${TF_STATE_SA}" \
  --resource-group "${TF_STATE_RG}" \
  --location "${LOCATION}" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access false \
  --min-tls-version TLS1_2

az storage account blob-service-properties update \
  --account-name "${TF_STATE_SA}" \
  --resource-group "${TF_STATE_RG}" \
  --enable-versioning true \
  --enable-delete-retention true \
  --delete-retention-days 30

az storage container create \
  --name "${CONTAINER_NAME}" \
  --account-name "${TF_STATE_SA}" \
  --auth-mode login

echo "▶ Creating PROD state storage account: ${TF_STATE_SA_PROD}..."
az storage account create \
  --name "${TF_STATE_SA_PROD}" \
  --resource-group "${TF_STATE_RG}" \
  --location "${LOCATION}" \
  --sku Standard_GRS \
  --kind StorageV2 \
  --allow-blob-public-access false \
  --min-tls-version TLS1_2

az storage account blob-service-properties update \
  --account-name "${TF_STATE_SA_PROD}" \
  --resource-group "${TF_STATE_RG}" \
  --enable-versioning true \
  --enable-delete-retention true \
  --delete-retention-days 90

az storage container create \
  --name "${CONTAINER_NAME}" \
  --account-name "${TF_STATE_SA_PROD}" \
  --auth-mode login

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "NEXT STEPS:"
echo "  1. Create an Azure AD App Registration for GitHub OIDC (see CREDENTIALS_CHECKLIST.md)"
echo "  2. Add GitHub Secrets: ARM_CLIENT_ID, ARM_TENANT_ID, ARM_SUBSCRIPTION_ID"
echo "  3. Run: cd infrastructure/environments/dev && terraform init -backend-config=backend.tf"
echo "  4. Run: terraform plan"
