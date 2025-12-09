# Development Guide

Quick reference for developing the Survey Kiosk application.

## Quick Start

### First Time Setup

```bash
./setup-dev.sh
```

### Run Development Server

```bash
./run-dev.sh
```

**Manual:**
```bash
source .venv/bin/activate
python app.py
```

Access at: http://localhost:5000

## Development Features

### Auto-Reload
The Flask development server automatically reloads when you change:
- `app.py` (Python code)
- `templates/*.html` (HTML templates)

**Note:** Browser refresh may be needed for template changes.

### Debug Mode
Development mode includes:
- Detailed error pages with stack traces
- Interactive debugger in browser
- Auto-reload on code changes
- Request logging

## Common Tasks

### Activate Virtual Environment

```bash
source .venv/bin/activate
```

### Install New Package

```bash
# Activate venv first
source .venv/bin/activate

# Install package
pip install package-name

# Update requirements
pip freeze > requirements.txt
```

### Reset Data

```bash
# Clear all surveys and responses
rm -rf data

# Restart server - directories will be recreated
./run-dev.sh
```

### Change Port

```bash
export PORT=8080
python app.py
```

### Disable Debug Mode

```bash
export FLASK_DEBUG=False
python app.py
```

### Set Custom Admin Password

```bash
export ADMIN_PASSWORD=my-secure-password
python app.py
```

## Project Structure

```
feedback-kiosk/
├── app.py                    # Main Flask application
│   ├── Routes (/)            # Landing page
│   ├── Routes (/surveys)     # Survey list
│   ├── Routes (/survey/<id>) # Survey form
│   ├── Routes (/admin/*)     # Admin routes
│   └── API (/api/*)          # REST endpoints
│
├── templates/                # Jinja2 templates
│   ├── base.html            # Base template (CSS included)
│   ├── index.html           # Landing page
│   ├── surveys.html         # Survey list
│   ├── survey_form.html     # iPad tile grid interface
│   ├── admin_login.html     # Admin authentication
│   ├── admin_dashboard.html # Admin home
│   ├── admin_new_survey.html # Survey creation form
│   └── admin_results.html   # Results visualization
│
├── data/                     # Data storage (gitignored)
│   ├── surveys.json         # Survey definitions
│   ├── responses.json       # User responses
│   └── images/              # Uploaded images
│
├── .venv/                    # Virtual environment (gitignored)
│
├── requirements.txt          # Python dependencies
├── Dockerfile               # Production container
├── compose.yaml             # Docker Compose config
├── .github/
│   └── workflows/
│       └── docker-build.yml # CI/CD workflow
│
├── setup-dev.sh             # Setup script
└── run-dev.sh               # Run script
```

## Key Files

### app.py
Main Flask application with:
- Route handlers
- File-based data storage functions
- Image upload handling
- Statistics calculation

### templates/survey_form.html
iPad-optimized survey interface with:
- Responsive tile grid
- Multi-select functionality
- Thank you screen with countdown
- Auto-reset functionality

### templates/admin_new_survey.html
Survey creation interface with:
- Image upload with preview
- Dynamic item management
- Base64 encoding for images

## Data Models

### Survey
```python
{
    "id": "1",
    "title": "Survey Title",
    "description": "Survey description",
    "items": [
        {
            "id": "item_1",
            "text": "Option text",      # Optional
            "image": "filename.png"      # Optional
        }
    ],
    "created_at": "2024-01-15T10:30:00",
    "first_response_at": "2024-01-15T11:00:00"  # or None
}
```

### Response
```python
{
    "survey_id": "1",
    "selected_items": ["item_1", "item_3"],
    "timestamp": "2024-01-15T11:00:00"
}
```

## Testing Workflow

1. **Start server:**
   ```bash
   ./run-dev.sh
   ```

2. **Create test survey:**
   - Go to http://localhost:5000
   - Click "Admin Login" (password: `admin123`)
   - Click "Create New Survey"
   - Add items with text/images
   - Save survey

3. **Test user flow:**
   - Go to http://localhost:5000
   - Click "Take a Survey"
   - Select created survey
   - Tap tiles to select
   - Submit
   - Verify thank you screen
   - Wait for countdown/reset

4. **Check results:**
   - Admin dashboard
   - Click "View Results"
   - Verify counts and percentages

## Common Issues

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process or use different port
export PORT=8080
python app.py
```

### Module not found
```bash
# Make sure venv is activated
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Images not showing
```bash
# Check data/images directory exists
mkdir -p data/images

# Check file permissions
chmod 755 data/images
```

### Changes not reflecting
- For Python changes: Server should auto-reload
- For template changes: Clear browser cache or hard refresh (Ctrl+Shift+R)
- For CSS changes: Embedded in templates, needs hard refresh

## Production Testing

To test production configuration locally:

```bash
# Build Docker image
docker build -t survey-kiosk .

# Run container
docker run -p 5000:5000 -v survey-data:/app/data survey-kiosk

# Access at http://localhost:5000
```

### Rebuilding After Changes

When you make changes and want to test with Docker:

**Quick rebuild with Makefile:**
```bash
# Rebuild and restart with fresh image
make docker-rebuild-run

# Or just rebuild (no restart)
make docker-rebuild
```

**Manual rebuild:**
```bash
# Stop, rebuild without cache, and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Or use the --build flag on restart
docker compose up -d --build --force-recreate
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `FLASK_DEBUG` | `True` | Enable debug mode |
| `ADMIN_PASSWORD` | `admin123` | Admin dashboard password |
| `SECRET_KEY` | `your-secret-key-change-in-production` | Flask session secret |

## Debugging Tips

### Enable verbose logging
Edit `app.py` to add logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Print variables
```python
print(f"Survey ID: {survey_id}")
print(f"Items: {items}")
```

### Use Flask debugger
When an error occurs in debug mode, click on the traceback in the browser to open an interactive console.

### Check data files
```bash
# View surveys
cat data/surveys.json

# View responses
cat data/responses.json

# Pretty print
python -m json.tool data/surveys.json
```

## Contributing

1. Make changes in a feature branch
2. Test thoroughly in development mode
3. Update documentation if needed
4. Test with Docker build
5. Submit pull request

## Additional Resources

- Flask Documentation: https://flask.palletsprojects.com/
- Jinja2 Templates: https://jinja.palletsprojects.com/
- Docker Documentation: https://docs.docker.com/
