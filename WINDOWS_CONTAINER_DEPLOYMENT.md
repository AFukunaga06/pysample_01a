# Windows Container Deployment Guide for JANコード管理アプリ

## Overview

This guide explains how to deploy the original CustomTkinter desktop application to Azure Container Instances using Windows containers with GUI support and remote desktop access.

## Architecture

- **Base Image**: Windows Server 2022 Core with Desktop Experience
- **Application**: Original `jan_code_app.py` (CustomTkinter GUI)
- **Access Method**: Remote Desktop Protocol (RDP) on port 3389
- **Credentials**: Handled via Azure environment variables
- **Container Service**: Azure Container Instances (Windows containers)

## Prerequisites

1. **Azure CLI** installed and configured
2. **Docker Desktop** with Windows containers support
3. **Azure subscription** with Container Instances permissions
4. **Google Sheets JSON credentials** file

## Deployment Files

### Core Files
- `Dockerfile.windows` - Windows container configuration
- `azure-container-deployment.json` - ARM template for Azure deployment
- `deploy-to-azure.ps1` - PowerShell deployment script
- `deploy-to-azure.sh` - Bash deployment script
- `jan_code_app.py` - Modified desktop application with environment variable support

### Key Features

#### Dockerfile.windows
- Uses Windows Server 2022 Core as base image
- Installs Python 3.11 and required dependencies
- Configures Remote Desktop Services
- Creates user account for RDP access
- Sets up automatic application startup

#### Modified jan_code_app.py
- Supports Google credentials from environment variable `GOOGLE_CREDENTIALS_JSON`
- Maintains all original desktop functionality
- Compatible with Windows container environment

## Deployment Steps

### Step 1: Build and Deploy

#### Option A: Using PowerShell (Recommended)
```powershell
.\deploy-to-azure.ps1 -ResourceGroupName "pysample-rg" -ContainerGroupName "pysample-desktop" -GoogleCredentialsJsonPath "samplep20240906-5ae36c9a4acd.json"
```

#### Option B: Using Bash
```bash
./deploy-to-azure.sh -g "pysample-rg" -n "pysample-desktop" -c "samplep20240906-5ae36c9a4acd.json"
```

### Step 2: Connect via Remote Desktop

After deployment, you'll receive:
- **Public IP Address**: `<IP_ADDRESS>`
- **RDP Port**: `3389`
- **Username**: `azureuser`
- **Password**: `P@ssw0rd123!`

#### Windows Connection
1. Open Remote Desktop Connection (`mstsc`)
2. Enter: `<IP_ADDRESS>:3389`
3. Login with: `azureuser` / `P@ssw0rd123!`

#### macOS Connection
1. Install Microsoft Remote Desktop from App Store
2. Add PC with IP: `<IP_ADDRESS>:3389`
3. Login with provided credentials

#### Linux Connection
```bash
rdesktop -u azureuser -p 'P@ssw0rd123!' <IP_ADDRESS>:3389
```

## Environment Variables

The container automatically configures:

- `GOOGLE_CREDENTIALS_JSON` - Google Sheets API credentials (from deployment parameter)
- `SPREADSHEET_KEY` - Google Sheets ID (default: `17Le1KA9nzMREt0Qp9_elM1OF1q8aSp-GDBZRPOntNI8`)
- `PYTHONPATH` - Application path (`C:\app`)

## Application Features

The deployed desktop application maintains all original functionality:

### Core Features
- **JANコード管理**: Copy JAN codes from Google Sheets
- **テキスト抽出**: Extract text using OCR functionality
- **座標軸コピー**: Screen coordinate capture
- **Google Sheets統合**: Real-time data synchronization

### GUI Components
- 3x5 button grid layout (matching original design)
- Color-coded buttons (green, red, blue)
- Dialog boxes for input and results
- Clipboard integration

## Monitoring and Troubleshooting

### View Container Logs
```bash
az container logs --resource-group pysample-rg --name pysample-desktop
```

### Check Container Status
```bash
az container show --resource-group pysample-rg --name pysample-desktop
```

### Common Issues

#### RDP Connection Failed
- Verify public IP address
- Check firewall settings
- Ensure port 3389 is accessible

#### Application Not Starting
- Check container logs for Python errors
- Verify Google credentials environment variable
- Confirm all dependencies are installed

#### Google Sheets Connection Error
- Validate JSON credentials format
- Check spreadsheet permissions
- Verify internet connectivity from container

## Cost Considerations

### Azure Container Instances Pricing
- **CPU**: ~$0.0012 per vCPU per second
- **Memory**: ~$0.00016 per GB per second
- **Windows containers**: Additional Windows licensing costs

### Estimated Monthly Cost (2 vCPU, 4GB RAM, 24/7)
- Approximately $150-200 USD per month
- Costs vary by Azure region

## Security Considerations

### Network Security
- Container exposes only port 3389 (RDP)
- Public IP with RDP access (consider VPN for production)
- Strong password authentication

### Credential Security
- Google credentials stored as secure environment variables
- No credentials embedded in container image
- Temporary credential files created at runtime

## Scaling and Management

### Container Management
```bash
# Stop container
az container stop --resource-group pysample-rg --name pysample-desktop

# Start container
az container start --resource-group pysample-rg --name pysample-desktop

# Delete container
az container delete --resource-group pysample-rg --name pysample-desktop
```

### Resource Scaling
- Modify ARM template for different CPU/memory configurations
- Redeploy with updated resource requirements

## Alternative Deployment Options

If Windows containers prove challenging, consider:

1. **Azure Virtual Machine**: Full Windows VM with RDP access
2. **Azure Virtual Desktop**: Multi-user Windows desktop environment
3. **Web Application**: Continue with Flask-based web version

## Support and Maintenance

### Regular Maintenance
- Monitor container resource usage
- Update base Windows image periodically
- Rotate RDP credentials regularly
- Backup Google Sheets data

### Updates and Changes
- Modify `jan_code_app.py` for application updates
- Rebuild container image for dependency updates
- Update ARM template for infrastructure changes

This deployment provides a cloud-hosted version of the original desktop application while maintaining full GUI functionality and user experience.
