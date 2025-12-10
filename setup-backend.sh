#!/bin/bash

# Survey Kiosk - Backend Setup Script
# Sets up the Node.js Express backend

set -e  # Exit on error

echo "=================================="
echo "Survey Kiosk - Backend Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo "✓ npm $(npm -v) detected"
echo ""

# Navigate to backend directory
cd backend

echo "Installing backend dependencies..."
npm install

echo ""
echo "Setting up environment configuration..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please edit backend/.env to configure:"
    echo "   - ADMIN_PASSWORD (default: admin123)"
    echo "   - SESSION_SECRET (required for production)"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "=================================="
echo "Backend Setup Complete!"
echo "=================================="
echo ""
echo "To start the backend development server:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Backend will run at: http://localhost:3001"
echo ""
