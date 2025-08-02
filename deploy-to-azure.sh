#!/bin/bash


set -e

LOCATION="eastus"
SPREADSHEET_KEY="17Le1KA9nzMREt0Qp9_elM1OF1q8aSp-GDBZRPOntNI8"

usage() {
    echo "Usage: $0 -g <resource-group> -n <container-name> -c <credentials-json-path> [-l <location>] [-s <spreadsheet-key>]"
    echo "  -g: Azure resource group name"
    echo "  -n: Container group name"
    echo "  -c: Path to Google credentials JSON file"
    echo "  -l: Azure location (default: eastus)"
    echo "  -s: Google Sheets spreadsheet key (default: 17Le1KA9nzMREt0Qp9_elM1OF1q8aSp-GDBZRPOntNI8)"
    exit 1
}

while getopts "g:n:c:l:s:h" opt; do
    case $opt in
        g) RESOURCE_GROUP="$OPTARG" ;;
        n) CONTAINER_GROUP="$OPTARG" ;;
        c) CREDENTIALS_PATH="$OPTARG" ;;
        l) LOCATION="$OPTARG" ;;
        s) SPREADSHEET_KEY="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

if [[ -z "$RESOURCE_GROUP" || -z "$CONTAINER_GROUP" || -z "$CREDENTIALS_PATH" ]]; then
    echo "Error: Missing required parameters"
    usage
fi

echo "Deploying JANコード管理アプリ to Azure Container Instances..."

if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi

if [[ ! -f "$CREDENTIALS_PATH" ]]; then
    echo "Error: Google credentials JSON file not found: $CREDENTIALS_PATH"
    exit 1
fi

GOOGLE_CREDENTIALS_JSON=$(cat "$CREDENTIALS_PATH")

echo "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "Deploying container instance..."
DEPLOYMENT_RESULT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "azure-container-deployment.json" \
    --parameters containerGroupName="$CONTAINER_GROUP" \
                 location="$LOCATION" \
                 googleCredentialsJson="$GOOGLE_CREDENTIALS_JSON" \
                 spreadsheetKey="$SPREADSHEET_KEY" \
    --output json)

if [[ $? -eq 0 ]]; then
    echo "Deployment successful!"
    
    PUBLIC_IP=$(az container show --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_GROUP" --query "ipAddress.ip" --output tsv)
    
    echo "Container deployed successfully!"
    echo "Public IP Address: $PUBLIC_IP"
    echo "RDP Connection: mstsc /v:$PUBLIC_IP:3389"
    echo "Username: azureuser"
    echo "Password: P@ssw0rd123!"
    echo ""
    echo "To connect via Remote Desktop:"
    echo "1. Open Remote Desktop Connection (mstsc)"
    echo "2. Enter server: $PUBLIC_IP:3389"
    echo "3. Use credentials: azureuser / P@ssw0rd123!"
    echo "4. The JANコード管理アプリ will start automatically"
    
else
    echo "Deployment failed!"
    exit 1
fi
