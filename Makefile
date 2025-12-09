.PHONY: help setup run clean test docker-build docker-rebuild docker-rebuild-run docker-run docker-stop docker-logs

help:
	@echo "Survey Kiosk - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup            - Create virtual environment and install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make run              - Run development server with live reload"
	@echo "  make clean            - Remove virtual environment and data"
	@echo "  make clean-data       - Remove data directory only"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build     - Build Docker image"
	@echo "  make docker-rebuild   - Rebuild Docker image (no cache)"
	@echo "  make docker-rebuild-run - Rebuild and restart containers with fresh image"
	@echo "  make docker-run       - Run with Docker Compose"
	@echo "  make docker-stop      - Stop Docker containers"
	@echo "  make docker-logs      - View Docker container logs"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run test suite (if available)"

setup:
	@echo "Setting up development environment..."
	python3 -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "Setup complete! Run 'make run' to start the server."

run:
	@echo "Starting development server..."
	@mkdir -p data/images
	@. .venv/bin/activate && python app.py

clean:
	@echo "Cleaning up..."
	rm -rf .venv
	rm -rf data
	rm -rf __pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Clean complete!"

clean-data:
	@echo "Removing data directory..."
	rm -rf data
	@echo "Data cleaned!"

docker-build:
	@echo "Building Docker image..."
	docker build -t survey-kiosk .
	@echo "Build complete!"

docker-rebuild:
	@echo "Rebuilding Docker image with latest changes..."
	docker compose build --no-cache
	@echo "Rebuild complete!"

docker-rebuild-run:
	@echo "Rebuilding and restarting containers with latest changes..."
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "Containers restarted with fresh build! Access at http://localhost:5000"

docker-run:
	@echo "Starting Docker containers..."
	docker compose up -d
	@echo "Containers started! Access at http://localhost:5000"

docker-stop:
	@echo "Stopping Docker containers..."
	docker compose down
	@echo "Containers stopped!"

docker-logs:
	docker compose logs -f

test:
	@echo "Running tests..."
	@. .venv/bin/activate && python -m pytest tests/ 2>/dev/null || echo "No tests found. Create tests in tests/ directory."

install:
	@. .venv/bin/activate && pip install $(PACKAGE)
	@. .venv/bin/activate && pip freeze > requirements.txt
	@echo "Package installed and requirements.txt updated!"
