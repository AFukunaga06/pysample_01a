# PowerShell script to deploy the Windows container to Azure Container Instances

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$ContainerGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$GoogleCredentialsJsonPath,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$SpreadsheetKey = "17Le1KA9nzMREt0Qp9_elM1OF1q8aSp-GDBZRPOntNI8"
)

Write-Host "Deploying JANコード管理アプリ to Azure Container Instances..." -ForegroundColor Green

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it first."
    exit 1
}

# Login to Azure (if not already logged in)
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
$loginStatus = az account show 2>$null
if (-not $loginStatus) {
    Write-Host "Please login to Azure..." -ForegroundColor Yellow
    az login
}

# Read Google credentials JSON file
if (-not (Test-Path $GoogleCredentialsJsonPath)) {
    Write-Error "Google credentials JSON file not found: $GoogleCredentialsJsonPath"
    exit 1
}

$googleCredentialsJson = Get-Content $GoogleCredentialsJsonPath -Raw

# Create resource group if it doesn't exist
Write-Host "Creating resource group: $ResourceGroupName" -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

# Deploy the ARM template
Write-Host "Deploying container instance..." -ForegroundColor Yellow
$deploymentResult = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file "azure-container-deployment.json" `
    --parameters containerGroupName=$ContainerGroupName `
                 location=$Location `
                 googleCredentialsJson=$googleCredentialsJson `
                 spreadsheetKey=$SpreadsheetKey `
    --output json | ConvertFrom-Json

if ($deploymentResult) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    
    # Get the public IP address
    $containerGroup = az container show --resource-group $ResourceGroupName --name $ContainerGroupName --output json | ConvertFrom-Json
    $publicIP = $containerGroup.ipAddress.ip
    
    Write-Host "Container deployed successfully!" -ForegroundColor Green
    Write-Host "Public IP Address: $publicIP" -ForegroundColor Cyan
    Write-Host "RDP Connection: mstsc /v:$publicIP`:3389" -ForegroundColor Cyan
    Write-Host "Username: azureuser" -ForegroundColor Cyan
    Write-Host "Password: P@ssw0rd123!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To connect via Remote Desktop:" -ForegroundColor Yellow
    Write-Host "1. Open Remote Desktop Connection (mstsc)" -ForegroundColor White
    Write-Host "2. Enter server: $publicIP`:3389" -ForegroundColor White
    Write-Host "3. Use credentials: azureuser / P@ssw0rd123!" -ForegroundColor White
    Write-Host "4. The JANコード管理アプリ will start automatically" -ForegroundColor White
    
} else {
    Write-Error "Deployment failed!"
    exit 1
}
