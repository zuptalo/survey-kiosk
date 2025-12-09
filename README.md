# Survey Kiosk - Tile-Based Feedback Collection

A modern, containerized survey application designed for iPad kiosks. Users select from a visual grid of tiles (text, images, or both) to provide feedback.

## Features

### User Experience
- **Visual Tile Grid**: Clean, iPad-optimized interface with responsive tile layout
- **Multi-Select**: Tap multiple tiles to select preferences
- **Mixed Content**: Support for text-only, image-only, or text+image tiles
- **Automatic Reset**: After submission, shows thank you message with 10-second countdown before resetting
- **Touch-Optimized**: Perfect for iPad kiosks with smooth animations and visual feedback

### Admin Dashboard
- **Password-Protected**: Secure admin access
- **Easy Survey Creation**: Create surveys with customizable tiles
- **Image Upload**: Support for JPG, PNG, GIF images
- **Detailed Analytics**: View selection counts and percentages
- **Timeline Tracking**: See when survey was created and first response received

### Data Storage
- **File-Based**: No database required, JSON storage
- **Image Management**: Organized image storage
- **Docker Volumes**: Persistent data across container restarts

## Quick Start

### Option 1: Local Development (Recommended for Development)

**Using Makefile (macOS/Linux):**
```bash
# Setup virtual environment and install dependencies
make setup

# Run in development mode with live reload
make run
```

**Using Scripts:**
```bash
# Setup virtual environment and install dependencies
./setup-dev.sh

# Run in development mode with live reload
./run-dev.sh
```

**Manual Setup:**
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run in development mode (with live reload)
python app.py
```

The application will start at http://localhost:5000 with:
- **Live reload** enabled (auto-restart on code changes)
- **Debug mode** enabled (detailed error messages)
- Admin password: `admin123` (override with `ADMIN_PASSWORD` env var)

### Option 2: Using Docker Compose (Recommended for Production)

1. Build and start the container:
```bash
docker compose up -d
```

2. Access the application:
   - Main page: http://localhost:5000
   - Admin password: `admin123` (default)

3. Stop the container:
```bash
docker compose down
```

**For production deployment with custom configuration:**

1. Create a local `data` directory (optional, for direct file access):
```bash
mkdir -p data
```

2. Update `compose.yaml` to mount local directory and set environment variables:
```yaml
services:
  survey-kiosk:
    # ... other settings ...
    volumes:
      - ./data:/app/data  # Mount local directory
    environment:
      - ADMIN_PASSWORD=your-secure-password
      - SECRET_KEY=your-random-secret-key-here
```

3. Start with your configuration:
```bash
docker compose up -d
```

All survey data, responses, and images will be stored in the mounted `data` directory and persist across container restarts.

## Usage Guide

### For Survey Participants (Kiosk Mode)

1. Navigate to http://localhost:5000
2. Tap "Take a Survey"
3. Select a survey
4. Tap multiple tiles to select your choices
5. Press "Submit" when done
6. View thank you message (survey resets after 10 seconds)

### For Administrators

#### Creating a Survey

1. Go to http://localhost:5000
2. Click "Admin Login"
3. Enter password: `admin123`
4. Click "Create New Survey"
5. Fill in survey details:
   - Survey title
   - Description (instructions for users)
6. Add items (tiles):
   - Text only: Enter text, leave image blank
   - Image only: Upload image, leave text blank
   - Text + Image: Enter text and upload image
7. Click "Create Survey"

#### Viewing Results

1. From admin dashboard, click "View Results" on any survey
2. See statistics:
   - Total responses
   - Selection count per item
   - Percentage breakdown
   - Visual progress bars
   - Most popular items
   - Average selections per response

## Development Workflow

### Making Code Changes

When running in development mode (using `./run-dev.sh` or `run-dev.bat`), the Flask server automatically reloads when you make changes to:
- Python files (`app.py`)
- Templates (`.html` files in `templates/`)

**Note:** You may need to manually refresh your browser to see template changes.

### Environment Variables

You can customize the application behavior using environment variables:

```bash
# Set custom port (default: 5000)
export PORT=8080

# Disable debug mode (default: enabled in dev)
export FLASK_DEBUG=False

# Run the application
python app.py
```

### Working with the Virtual Environment

**Activate:**
```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

**Deactivate:**
```bash
deactivate
```

**Install new packages:**
```bash
# Make sure virtual environment is activated
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

### Directory Structure During Development

```
feedback-kiosk/
├── .venv/              # Virtual environment (auto-created)
├── data/               # Data storage (auto-created)
│   ├── surveys.json
│   ├── responses.json
│   └── images/
├── app.py              # Main application
├── templates/          # HTML templates
├── setup-dev.sh        # Setup script (Unix)
├── setup-dev.bat       # Setup script (Windows)
├── run-dev.sh          # Run script (Unix)
└── run-dev.bat         # Run script (Windows)
```

### Testing During Development

1. Start the development server:
   ```bash
   ./run-dev.sh
   ```

2. Open http://localhost:5000 in your browser

3. Make changes to code - server auto-reloads

4. Refresh browser to see changes

### Resetting Development Data

To clear all surveys and responses during development:

```bash
# Remove data directory
rm -rf data

# Restart the application
./run-dev.sh
```

The application will automatically recreate the necessary directories.

## Configuration

### Environment Variables

The application supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_PASSWORD` | `admin123` | Admin dashboard password |
| `SECRET_KEY` | `your-secret-key-change-in-production` | Flask session secret key |
| `PORT` | `5000` | Server port |
| `FLASK_DEBUG` | `True` (dev) / `False` (prod) | Enable debug mode |

**Setting via Docker Compose:**

Edit `compose.yaml`:
```yaml
environment:
  - ADMIN_PASSWORD=your-secure-password
  - SECRET_KEY=your-random-secret-key
```

**Setting via command line:**
```bash
export ADMIN_PASSWORD=your-secure-password
export SECRET_KEY=your-secret-key
python app.py
```

**Setting via Docker run:**
```bash
docker run -e ADMIN_PASSWORD=your-password -p 5000:5000 survey-kiosk
```

### Supported Image Formats

- JPEG/JPG
- PNG
- GIF

### iPad Optimization

The interface is optimized for standard iPad dimensions (1024px width). The tile grid automatically adjusts based on screen size.

## Data Structure

### Survey Object
```json
{
  "id": "1",
  "title": "What features do you want?",
  "description": "Select all that apply",
  "items": [
    {
      "id": "item_1",
      "text": "Dark Mode",
      "image": "1234567890_1.png"
    },
    {
      "id": "item_2",
      "text": "Notifications"
    }
  ],
  "created_at": "2024-01-15T10:30:00",
  "first_response_at": "2024-01-15T11:00:00"
}
```

### Response Object
```json
{
  "survey_id": "1",
  "selected_items": ["item_1", "item_3", "item_5"],
  "timestamp": "2024-01-15T11:00:00"
}
```

## Project Structure

```
feedback-kiosk/
├── app.py                    # Flask application
├── requirements.txt          # Python dependencies
├── Dockerfile               # Container configuration
├── compose.yaml             # Docker Compose setup
├── templates/               # HTML templates
│   ├── base.html           # Base template with styles
│   ├── index.html          # Landing page
│   ├── surveys.html        # Survey list
│   ├── survey_form.html    # iPad-optimized tile grid
│   ├── admin_login.html    # Admin login
│   ├── admin_dashboard.html # Admin home
│   ├── admin_new_survey.html # Survey creation
│   └── admin_results.html  # Results visualization
└── data/                    # Data storage (auto-created)
    ├── surveys.json        # Survey definitions
    ├── responses.json      # User responses
    └── images/             # Uploaded images
```

## API Endpoints

### Public Routes
- `GET /` - Landing page
- `GET /surveys` - List all surveys
- `GET /survey/<id>` - Survey tile grid
- `POST /api/submit-survey` - Submit selections
- `GET /images/<filename>` - Serve images

### Admin Routes
- `GET /admin/login` - Admin login
- `GET /admin` - Admin dashboard
- `GET /admin/survey/new` - Create survey form
- `POST /admin/survey/new` - Save new survey
- `GET /admin/survey/<id>/results` - View results

## Security Notes

- **Change the default admin password** in production
- **Change the Flask secret key** in production
- Consider adding HTTPS for production use
- Images are stored as files, ensure proper permissions
- No user data beyond selections is collected

## Docker Volume Management

### Backup Data
```bash
docker cp survey-kiosk:/app/data ./backup
```

### Restore Data
```bash
docker cp ./backup/. survey-kiosk:/app/data/
```

### View Volume Location
```bash
docker volume inspect feedback-kiosk_survey-data
```

## CI/CD and Docker Registry

### Automated Builds

The project includes GitHub Actions that automatically build and push Docker images on every push to the `main` branch.

**Requirements:**
- `DOCKER_USERNAME` - Docker registry username (GitHub secret)
- `DOCKER_TOKEN` - Docker registry token/password (GitHub secret)

If these secrets are not configured, the workflow will skip the Docker build step without failing.

**Versioning:**
- Images are tagged with date-based versioning: `YYYYMMDD-N` (e.g., `20251210-1`)
- The `latest` tag always points to the most recent build
- Git tags are automatically created for each release

**Using published images:**
```bash
# Pull specific version
docker pull <username>/survey-kiosk:20251210-1

# Pull latest
docker pull <username>/survey-kiosk:latest

# Run from registry
docker run -p 5000:5000 -v ./data:/app/data <username>/survey-kiosk:latest
```

## Requirements

- Python 3.11+
- Flask 3.0.0
- Docker & Docker Compose (for containerized deployment)
- Modern web browser (Chrome, Safari, Firefox)
- iPad (standard size) for optimal kiosk experience

## Troubleshooting

### Images not showing
- Check that data/images directory exists and has write permissions
- Verify images are in supported formats (JPG, PNG, GIF)

### Survey not resetting after countdown
- Check browser console for JavaScript errors
- Ensure browser allows JavaScript execution

### Admin password not working
- Verify you haven't modified the password incorrectly
- Check for extra spaces in password

## License

This project is provided as-is for educational and internal use.
