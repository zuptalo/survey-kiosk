#!/bin/bash

# Survey Kiosk - Frontend Setup Script
# Sets up the React frontend with Vite

set -e  # Exit on error

echo "=================================="
echo "Survey Kiosk - Frontend Setup"
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

# Navigate to frontend directory
cd frontend

echo "Installing frontend dependencies..."
npm install

echo ""
echo "=================================="
echo "Frontend Setup Complete!"
echo "=================================="
echo ""
echo "To start the frontend development server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Frontend will run at: http://localhost:5173"
echo ""
echo "Note: Make sure the backend is running on port 3001"
echo "      for API requests to work properly."
echo ""
