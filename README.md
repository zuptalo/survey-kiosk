# Survey Kiosk - Tile-Based Feedback Collection

A modern, containerized survey application built with React and Node.js, designed for iPad kiosks. Users select from a visual grid of tiles (text, images, or both) to provide feedback.

## Features

### User Experience
- **Visual Tile Grid**: Clean, iPad-optimized interface with responsive tile layout
- **Multi-Select**: Tap multiple tiles to select preferences
- **Mixed Content**: Support for text-only, image-only, or text+image tiles
- **Automatic Reset**: After submission, shows thank you message with 10-second countdown before resetting
- **Touch-Optimized**: Perfect for iPad kiosks with smooth animations and visual feedback
- **PWA Support**: Installable as Progressive Web App with offline capabilities
- **Multilingual**: Switch between English and Swedish with flag button

### Admin Dashboard
- **Password-Protected**: Secure admin access
- **Easy Survey Creation**: Create surveys with customizable tiles
- **Image Upload**: Support for JPG, PNG, GIF images
- **Detailed Analytics**: View selection counts and percentages
- **Survey Management**: Duplicate, reset, or delete surveys
- **Timeline Tracking**: See when survey was created and first response received

### Data Storage
- **File-Based**: No database required, JSON storage
- **Image Management**: Organized image storage with base64 encoding
- **Docker Volumes**: Persistent data across container restarts

## Technology Stack

**Frontend:**
- React 18 with Vite
- React Router v6 for routing
- Axios for API calls
- i18next for internationalization
- CSS Modules with warm cafe theme

**Backend:**
- Node.js 18 with Express
- Session-based authentication
- File-based JSON storage
- Rate limiting and CORS support
- Multi-stage Docker builds

## Quick Start

### Option 1: Local Development (Recommended for Development)

Development mode runs frontend and backend separately with hot reload.

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend will start at http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend will start at http://localhost:5173

The Vite dev server will proxy API requests to the backend automatically.

**Default credentials:**
- Admin password: `admin123` (configure in backend/.env)

### Option 2: Using Docker Compose (Recommended for Production)

1. Build and start the container:
```bash
docker compose up -d
```

2. Access the application:
   - Main page: http://localhost:3001
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

2. Update `compose.yaml` to set environment variables:
```yaml
services:
  survey-kiosk:
    # ... other settings ...
    volumes:
      - ./data:/app/data  # Mount local directory
    environment:
      - NODE_ENV=production
      - ADMIN_PASSWORD=your-secure-password
      - SESSION_SECRET=your-random-secret-key-here
```

3. Start with your configuration:
```bash
docker compose up -d
```

All survey data, responses, and images will be stored in the mounted `data` directory and persist across container restarts.

### Rebuilding After Code Changes

When you make changes to the code, you need to rebuild the Docker image:

```bash
# Stop, rebuild without cache, and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Usage Guide

### For Survey Participants (Kiosk Mode)

1. Navigate to http://localhost:3001 (production) or http://localhost:5173 (dev)
2. Tap "Take a Survey"
3. Select a survey
4. Tap multiple tiles to select your choices
5. Press "Submit" when done
6. View thank you message (survey resets after 10 seconds)

### For Administrators

#### Creating a Survey

1. Go to the application homepage
2. Click "Admin Login"
3. Enter password: `admin123`
4. Click "New Survey"
5. Fill in survey details:
   - Survey title
   - Description (instructions for users)
6. Add items (tiles):
   - Text only: Enter text, leave image blank
   - Image only: Upload image, leave text blank
   - Text + Image: Enter text and upload image
7. Click "Create Survey"

#### Managing Surveys

- **Results**: See detailed statistics and response data
- **Edit**: Modify title, description, or items
- **Duplicate**: Create a copy with fresh ratings
- **Reset**: Clear all responses while keeping survey structure
- **Delete**: Permanently remove survey and all responses

#### Viewing Results

1. From admin dashboard, click "Results" on any survey
2. See statistics:
   - Total responses
   - Selection count per item
   - Percentage breakdown
   - Visual progress bars
   - Most popular items
   - Average selections per response

## Development Workflow

### Project Structure

```
feedback-kiosk/
├── backend/                 # Node.js Express backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment template
│   └── .env               # Environment configuration (create from .env.example)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   ├── i18n.js        # i18next configuration
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   │   ├── icon.png       # App icon (1024x1024)
│   │   └── manifest.json  # PWA manifest
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── data/                   # Data storage (auto-created)
│   ├── surveys.json       # Survey definitions
│   ├── responses.json     # User responses
│   └── images/            # Uploaded images
├── Dockerfile             # Multi-stage container build
├── compose.yaml           # Docker Compose configuration
└── README.md             # This file
```

### Making Code Changes

**Backend Changes (server.js, etc.):**
- Nodemon automatically restarts the server when you save changes
- No manual restart needed in development mode

**Frontend Changes (React components, styles):**
- Vite hot module replacement (HMR) updates instantly in browser
- No page reload needed for most changes

### Environment Variables

#### Backend (.env file)

Create `backend/.env` from `backend/.env.example`:

```bash
# Server configuration
PORT=3001
NODE_ENV=development

# Security
ADMIN_PASSWORD=admin123
SESSION_SECRET=your-random-secret-key-change-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

#### Docker Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `APP_NAME` | `Zuptalo` | Application name shown in UI and PWA manifest |
| `ADMIN_PASSWORD` | `admin123` | Admin dashboard password |
| `SESSION_SECRET` | (required) | Express session secret key |
| `THANK_YOU_COUNTDOWN` | `5` | Seconds to show thank you screen before reset |
| `INACTIVITY_TIMEOUT` | `30` | Minutes of inactivity before survey auto-resets |

**Setting via Docker Compose:**

Edit `compose.yaml`:
```yaml
environment:
  - NODE_ENV=production
  - APP_NAME=Your Custom Name
  - ADMIN_PASSWORD=your-secure-password
  - SESSION_SECRET=your-random-secret-key
  - THANK_YOU_COUNTDOWN=5
  - INACTIVITY_TIMEOUT=30
```

**Or create a `.env` file** (recommended for sensitive values):
```env
APP_NAME=Your Custom Name
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-random-secret-key
THANK_YOU_COUNTDOWN=5
INACTIVITY_TIMEOUT=30
```

Then run (no build needed if using pre-built image):
```bash
docker compose up -d
```

**Note:** The `APP_NAME` is loaded at runtime from the backend API, so changing it only requires restarting the container:
```bash
docker compose down
docker compose up -d
```

If you're building from source, the first time you'll need to build:
```bash
docker compose build
docker compose up -d
```

**Setting via Docker run:**
```bash
# Run with environment variables (uses pre-built image)
docker run -e APP_NAME="Your Custom Name" \
  -e ADMIN_PASSWORD=your-password \
  -e SESSION_SECRET=your-secret \
  -p 3001:3001 -v ./data:/app/data \
  <username>/survey-kiosk:react-latest
```

**Or build from source:**
```bash
# Build from source (optional build arg for fallback)
docker build --build-arg APP_NAME="Your Custom Name" -t survey-kiosk .

# Run
docker run -e APP_NAME="Your Custom Name" \
  -e ADMIN_PASSWORD=your-password \
  -e SESSION_SECRET=your-secret \
  -p 3001:3001 -v ./data:/app/data \
  survey-kiosk
```

### Supported Image Formats

- JPEG/JPG
- PNG
- GIF

Images are converted to base64 and stored in the JSON database.

### iPad Optimization

The interface is optimized for standard iPad dimensions (1024px width). The tile grid automatically adjusts based on screen size with responsive breakpoints at 480px, 768px, and 1024px.

### PWA Installation

The Survey Kiosk can be installed as a Progressive Web App for a native app-like experience:

**On iPad/iOS:**
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

**On Android:**
1. Open the app in Chrome
2. Tap the three-dot menu
3. Select "Add to Home Screen" or "Install app"
4. Tap "Install"

**On Desktop:**
1. Open the app in Chrome, Edge, or Safari
2. Look for the install icon in the address bar
3. Click "Install"

Once installed, the app will:
- Launch in fullscreen mode without browser chrome
- Display the custom icon on your device
- Work in landscape-primary orientation (ideal for kiosks)
- Use warm cafe colors for theme and splash screen
- Show your custom app name (configurable via APP_NAME environment variable)

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
      "image": "data:image/png;base64,..."
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

## API Endpoints

### Public Routes
- `GET /api/surveys` - List all surveys
- `GET /api/surveys/:id` - Get single survey
- `POST /api/surveys/:id/submit` - Submit response

### Admin Routes (require authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/status` - Check auth status
- `POST /api/admin/surveys` - Create survey
- `PUT /api/admin/surveys/:id` - Update survey
- `DELETE /api/admin/surveys/:id` - Delete survey
- `POST /api/admin/surveys/:id/duplicate` - Duplicate survey
- `POST /api/admin/surveys/:id/reset` - Reset ratings
- `GET /api/admin/surveys/:id/results` - Get results

## Security Notes

- **Change the default admin password** in production
- **Generate a secure session secret** for production
- Consider adding HTTPS for production use (use reverse proxy like Nginx)
- Images are stored as base64 in JSON files
- No user data beyond selections is collected
- Sessions expire after 24 hours of inactivity
- Rate limiting enabled on all endpoints

## Docker Volume Management

### Backup Data
```bash
docker cp survey-kiosk-react:/app/data ./backup
```

### Restore Data
```bash
docker cp ./backup/. survey-kiosk-react:/app/data/
```

### View Volume Location
```bash
docker volume inspect feedback-kiosk_survey-data
```

## CI/CD and Docker Registry

### Automated Builds

The project includes GitHub Actions that automatically build and push Docker images on every push to the `react-nodejs-implementation` branch.

**Multi-Architecture Support:**
- Images are built for both `linux/amd64` (x86_64) and `linux/arm64` (ARM)
- Works on Intel/AMD servers, Raspberry Pi, Apple Silicon Macs, and ARM-based cloud instances

**Requirements:**
- `DOCKER_USERNAME` - Docker registry username (GitHub secret)
- `DOCKER_TOKEN` - Docker registry token/password (GitHub secret)

If these secrets are not configured, the workflow will skip the Docker build step without failing.

**Versioning:**
- Images are tagged with `react-YYYYMMDD-N` prefix (e.g., `react-20251210-1`)
- The `react-latest` tag always points to the most recent build
- Git tags are automatically created for each release

**Using published images:**
```bash
# Pull specific version (automatically selects correct architecture)
docker pull <username>/survey-kiosk:react-20251210-1

# Pull latest React version
docker pull <username>/survey-kiosk:react-latest

# Run from registry
docker run -p 3001:3001 -v ./data:/app/data <username>/survey-kiosk:react-latest
```

**Verify architecture:**
```bash
# Check which architectures are available
docker buildx imagetools inspect <username>/survey-kiosk:react-latest
```

## Requirements

**Development:**
- Node.js 18+
- npm or yarn

**Production:**
- Docker & Docker Compose (for containerized deployment)
- Modern web browser (Chrome, Safari, Firefox)
- iPad (standard size) for optimal kiosk experience

## Troubleshooting

### Backend won't start
- Check that port 3001 is not in use: `lsof -i :3001`
- Verify `.env` file exists in backend directory
- Check Node.js version: `node --version` (should be 18+)

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check Vite proxy configuration in `frontend/vite.config.js`
- Check browser console for CORS errors

### Images not showing
- Check that data/images directory exists and has write permissions
- Verify images are in supported formats (JPG, PNG, GIF)
- Check that images are properly base64 encoded

### Survey not resetting after countdown
- Check browser console for JavaScript errors
- Ensure browser allows JavaScript execution
- Verify React app is properly loaded

### Admin password not working
- Check backend/.env for correct ADMIN_PASSWORD
- Verify no extra spaces in password
- Check browser console for authentication errors
- Clear browser cookies and try again

### Docker build fails
- Ensure both frontend/ and backend/ directories exist
- Check that package.json files are valid
- Try building without cache: `docker compose build --no-cache`

## Migration from Python/Flask Version

If you're migrating from the Python Flask version:

1. Your existing data is compatible:
   - `data/surveys.json` - same format
   - `data/responses.json` - same format
   - `data/images/` - images will be migrated to base64 in JSON

2. Simply mount the same data directory:
```bash
docker run -v ./data:/app/data -p 3001:3001 survey-kiosk
```

3. The backend will automatically migrate image files to base64 format on first run.

## License

This project is provided as-is for educational and internal use.
