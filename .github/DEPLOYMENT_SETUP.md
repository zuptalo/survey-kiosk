# Automatic Deployment Setup

This guide explains how to configure automatic deployment to Portainer when Docker images are built.

## Prerequisites

You need to have the following information from your Portainer setup:
- Portainer Base URL (e.g., `https://portainer.example.com`)
- Portainer API Access Token
- Stack ID (from the Portainer stack URL)
- Endpoint ID (from the Portainer stack URL)

## GitHub Repository Configuration

### 1. Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → Secrets

Add the following **secrets**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `TR_BASE_URL` | Your Portainer base URL | `https://portainer.example.com` |
| `TR_ACCESS_TOKEN` | Portainer API access token | Your API token from Portainer |
| `DOCKER_USERNAME` | Docker Hub username | `yourusername` |
| `DOCKER_TOKEN` | Docker Hub access token | Your Docker Hub token |

### 2. Add Repository Variables

Go to your GitHub repository → Settings → Secrets and variables → Actions → Variables

Add the following **variables**:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `TR_STACK_ID` | Portainer stack ID | `1` |
| `TR_ENDPOINT_ID` | Portainer endpoint ID | `1` |

## How to Get These Values

### Getting Portainer Stack ID and Endpoint ID

1. Log in to your Portainer instance
2. Navigate to your stack (e.g., survey-kiosk)
3. Look at the URL in your browser:
   ```
   https://portainer.example.com/#!/1/docker/stacks/survey-kiosk?id=123&endpointId=1&regular=true
   ```
   - Stack ID: `123` (the number after `id=`)
   - Endpoint ID: `1` (the number after `endpointId=`)

### Getting Portainer API Access Token

1. Log in to Portainer
2. Go to User Settings (click your username in top right)
3. Click "Access tokens"
4. Click "Add access token"
5. Give it a name (e.g., "GitHub Actions")
6. Copy the generated token immediately (you won't be able to see it again)

### Getting Docker Hub Credentials

1. Log in to Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Give it a name and set appropriate permissions
5. Copy the generated token

## How It Works

1. When you push to the `react-nodejs-implementation` branch
2. GitHub Actions builds a new Docker image with a versioned tag (e.g., `react-20251221-1`)
3. The image is pushed to Docker Hub
4. **Automatically**, the workflow updates your Portainer stack with the new image tag
5. Portainer pulls the new image and redeploys the container

## Testing the Setup

After configuring all secrets and variables:

1. Make a small change to your code
2. Commit and push to `react-nodejs-implementation` branch
3. Go to GitHub → Actions tab to watch the workflow
4. Check that all steps complete successfully, including "Update Portainer Stack"
5. Verify in Portainer that the stack was updated with the new image tag

## Troubleshooting

### Deployment step is skipped

- Verify that `TR_STACK_ID` and `TR_ENDPOINT_ID` variables are set
- Check that `TR_BASE_URL` and `TR_ACCESS_TOKEN` secrets are set

### 401 Unauthorized error

- Your `TR_ACCESS_TOKEN` may be invalid or expired
- Generate a new access token in Portainer

### 404 Not Found error

- Verify your `TR_STACK_ID` and `TR_ENDPOINT_ID` are correct
- Check that the stack still exists in Portainer

### 500 Internal Server Error

- Check Portainer logs for more details
- Verify the stack configuration is valid
- Ensure the Docker image name in the stack matches your repository

## Security Notes

- Never commit secrets or tokens to your repository
- Use GitHub Secrets for sensitive data (tokens, passwords)
- Use GitHub Variables for non-sensitive configuration (IDs, numbers)
- Regularly rotate your access tokens
- Use access tokens with minimal required permissions
