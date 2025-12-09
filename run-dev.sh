#!/bin/bash

# Run the application in development mode with live reload

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Running setup..."
    ./setup-dev.sh
fi

# Activate virtual environment
source .venv/bin/activate

# Create data directories if they don't exist
mkdir -p data/images

echo "Starting Flask development server with live reload..."
echo "Access the application at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

# Run Flask with debug mode and auto-reload
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
