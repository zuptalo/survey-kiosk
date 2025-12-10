#!/bin/bash

# Survey Kiosk - Complete Setup Script
# Sets up both backend and frontend for development

set -e  # Exit on error

echo "=========================================="
echo "Survey Kiosk - Complete Development Setup"
echo "=========================================="
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

# Setup Backend
echo "=========================================="
echo "Setting up Backend..."
echo "=========================================="
echo ""

cd backend

echo "Installing backend dependencies..."
npm install

echo ""
echo "Setting up backend environment configuration..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please edit backend/.env to configure:"
    echo "   - ADMIN_PASSWORD (default: admin123)"
    echo "   - SESSION_SECRET (required for production)"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

cd ..

# Setup Frontend
echo "=========================================="
echo "Setting up Frontend..."
echo "=========================================="
echo ""

cd frontend

echo "Installing frontend dependencies..."
npm install

echo ""
echo "✓ Frontend setup complete"
echo ""

cd ..

# Create data directory
echo "=========================================="
echo "Creating data directory..."
echo "=========================================="
echo ""

mkdir -p data/images
echo "✓ Data directory created"
echo ""

# All done
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start development, open TWO terminal windows:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo "  (Runs at http://localhost:3001)"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo "  (Runs at http://localhost:5173)"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Default admin password: admin123"
echo "(Change in backend/.env)"
echo ""
