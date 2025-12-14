# Development Guide

Quick reference for developing the Survey Kiosk application with React and Node.js.

## Quick Start

### First Time Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

**Frontend:**
```bash
cd frontend
npm install
```

### Run Development Server

You need two terminal windows running simultaneously.

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs at: http://localhost:3001 (with auto-reload via nodemon)

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173 (with hot module replacement)

## Development Features

### Auto-Reload

**Backend (Nodemon):**
- Automatically restarts server when you change:
  - `server.js` (Node.js code)
  - Any `.js` files in backend directory
- No manual restart needed

**Frontend (Vite HMR):**
- Hot Module Replacement updates instantly when you change:
  - React components (`.jsx` files)
  - CSS files
  - Configuration files
- Browser updates automatically without full page reload

### Debug Mode

Development mode includes:
- React DevTools support
- Detailed error messages with source maps
- Console logging enabled
- CORS configured for localhost development
- Request logging on backend
- Network error details

## Common Tasks

### Install New Package

**Backend:**
```bash
cd backend
npm install package-name

# For dev dependencies
npm install --save-dev package-name
```

**Frontend:**
```bash
cd frontend
npm install package-name

# For dev dependencies
npm install --save-dev package-name
```

### Reset Data

```bash
# Clear all surveys and responses
rm -rf data

# Backend will recreate directories on next start
cd backend
npm run dev
```

### Change Backend Port

Edit `backend/.env`:
```bash
PORT=8080
```

Or set environment variable:
```bash
PORT=8080 npm run dev
```

### Change Frontend Port

Edit `frontend/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000  // Change from 5173
  }
})
```

### Set Custom Admin Password

Edit `backend/.env`:
```bash
ADMIN_PASSWORD=my-secure-password
```

### Run Backend in Production Mode

```bash
cd backend
NODE_ENV=production npm start
```

## Project Structure

```
feedback-kiosk/
├── backend/                  # Node.js Express backend
│   ├── server.js            # Main server application
│   │   ├── Express setup
│   │   ├── Middleware (CORS, sessions, rate limiting)
│   │   ├── Routes (/api/*)
│   │   ├── Admin routes (/api/admin/*)
│   │   └── Data management functions
│   │
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Environment template
│   └── .env                # Environment config (create manually)
│
├── frontend/                # React application
│   ├── src/
│   │   ├── main.jsx        # Entry point
│   │   ├── App.jsx         # Main component with routing
│   │   ├── i18n.js         # i18next configuration
│   │   │
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── SurveyList.jsx
│   │   │   ├── SurveyForm.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminNewSurvey.jsx
│   │   │   ├── AdminEditSurvey.jsx
│   │   │   └── AdminResults.jsx
│   │   │
│   │   ├── components/     # Reusable components
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── TileGrid.jsx
│   │   │   ├── Tile.jsx
│   │   │   ├── ThankYou.jsx
│   │   │   ├── SurveyItem.jsx
│   │   │   ├── StatsTable.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── services/       # API layer
│   │   │   ├── api.js     # Axios instance
│   │   │   ├── surveyService.js
│   │   │   └── adminService.js
│   │   │
│   │   ├── context/        # React Context
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/          # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCountdown.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   └── utils/          # Utilities
│   │       ├── imageUtils.js
│   │       └── constants.js
│   │
│   ├── public/             # Static assets
│   │   ├── icon.png       # App icon
│   │   └── manifest.json  # PWA manifest
│   │
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
├── data/                   # Data storage (gitignored)
│   ├── surveys.json       # Survey definitions
│   ├── responses.json     # User responses
│   └── images/            # Uploaded images (legacy)
│
├── Dockerfile             # Multi-stage production build
├── compose.yaml           # Docker Compose config
├── .github/
│   └── workflows/
│       └── docker-build.yml # CI/CD workflow
│
└── REACT-NODEJS-IMPLEMENTATION.md # Implementation guide
```

## Key Files

### backend/server.js
Main Express application with:
- RESTful API endpoints
- File-based JSON data storage
- Session-based authentication
- Image upload/processing (base64)
- Statistics calculation
- Rate limiting and CORS

### frontend/src/App.jsx
Main React component with:
- React Router setup
- AuthProvider wrapper
- Route definitions
- Protected admin routes

### frontend/src/pages/SurveyForm.jsx
iPad-optimized survey interface with:
- Responsive tile grid
- Multi-select functionality
- Thank you screen with countdown
- Auto-reset functionality
- Language switching

### frontend/src/services/api.js
Axios API client with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Credential handling

## Data Models

### Survey
```javascript
{
  "id": "1",
  "title": "Survey Title",
  "description": "Survey description",
  "items": [
    {
      "id": "item_1",
      "text": "Option text",              // Optional
      "image": "data:image/png;base64,..." // Optional (base64)
    }
  ],
  "created_at": "2024-01-15T10:30:00",
  "first_response_at": "2024-01-15T11:00:00" // or null
}
```

### Response
```javascript
{
  "survey_id": "1",
  "selected_items": ["item_1", "item_3"],
  "timestamp": "2024-01-15T11:00:00"
}
```

## Testing Workflow

1. **Start both servers:**
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Create test survey:**
   - Go to http://localhost:5173
   - Click "Admin Login" (password: `admin123`)
   - Click "New Survey"
   - Add items with text/images
   - Save survey

3. **Test user flow:**
   - Go to http://localhost:5173
   - Click "Take a Survey"
   - Select created survey
   - Tap tiles to select
   - Submit
   - Verify thank you screen
   - Wait for countdown/reset

4. **Check results:**
   - Admin dashboard
   - Click "Results"
   - Verify counts and percentages

## API Testing

### Using curl

**Get all surveys:**
```bash
curl http://localhost:3001/api/surveys
```

**Get single survey:**
```bash
curl http://localhost:3001/api/surveys/1
```

**Admin login:**
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}' \
  -c cookies.txt
```

**Create survey (authenticated):**
```bash
curl -X POST http://localhost:3001/api/admin/surveys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Survey","description":"Test","items":[]}'
```

## Common Issues

### Backend port already in use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process or use different port
PORT=8080 npm run dev
```

### Frontend port already in use
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process or change port in vite.config.js
```

### Module not found
```bash
# Reinstall dependencies
cd backend && npm install
cd frontend && npm install

# Clear npm cache if issues persist
npm cache clean --force
```

### CORS errors
- Ensure backend is running on port 3001
- Check `frontend/vite.config.js` proxy configuration
- Verify `backend/.env` has correct FRONTEND_URL

### Images not showing
```bash
# Check data directory exists
mkdir -p data/images

# Check file permissions
chmod 755 data
chmod 755 data/images
```

### Changes not reflecting

**Backend:**
- Nodemon should auto-restart - check terminal for errors
- If not restarting, restart manually: Ctrl+C and `npm run dev`

**Frontend:**
- Vite HMR should update instantly
- If not working, hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check browser console for errors

### Session/Auth issues
- Clear browser cookies
- Check SESSION_SECRET is set in backend/.env
- Verify credentials are being sent with requests (withCredentials: true)

## Production Testing

To test production configuration locally:

### Using Docker

```bash
# Build Docker image
docker build -t survey-kiosk .

# Run container
docker run -p 3001:3001 -v ./data:/app/data survey-kiosk

# Access at http://localhost:3001
```

### Manual Production Build

**Build frontend:**
```bash
cd frontend
npm run build
# Creates frontend/dist directory
```

**Serve with backend:**
```bash
cd backend
# Copy built frontend to public directory
cp -r ../frontend/dist ./public

# Run in production mode
NODE_ENV=production npm start

# Access at http://localhost:3001
```

### Rebuilding After Changes

When you make changes and want to test with Docker:

```bash
# Stop, rebuild without cache, and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Node environment |
| `ADMIN_PASSWORD` | `admin123` | Admin password |
| `SESSION_SECRET` | (required) | Express session secret |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for CORS |

### Frontend (build time)

Vite uses environment variables prefixed with `VITE_`:

Create `frontend/.env.local`:
```bash
VITE_API_URL=http://localhost:3001
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## Debugging Tips

### Backend Debugging

**Enable verbose logging:**
Add to `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Use Node.js debugger:**
```bash
node --inspect backend/server.js
# Connect with Chrome DevTools: chrome://inspect
```

### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree, props, state

**Console logging:**
```javascript
console.log('Survey data:', survey);
console.table(items);
```

**Network tab:**
- Open browser DevTools → Network
- Monitor API requests
- Check request/response payloads

### Check data files
```bash
# View surveys
cat data/surveys.json

# View responses
cat data/responses.json

# Pretty print
node -e "console.log(JSON.stringify(require('./data/surveys.json'), null, 2))"
```

## Code Style

### Backend
- Use ES6+ features (import/export, async/await)
- Use descriptive variable names
- Add comments for complex logic
- Handle errors appropriately

### Frontend
- Use functional components with hooks
- Use arrow functions for components
- PropTypes or TypeScript for type checking (optional)
- Keep components small and focused
- Extract reusable logic to custom hooks

## Git Workflow

1. Make changes in a feature branch
2. Test thoroughly in development mode
3. Update documentation if needed
4. Test with Docker build
5. Commit with descriptive message
6. Push to remote repository

## Performance Optimization

### Frontend
- Use React.memo() for expensive components
- Lazy load routes with React.lazy()
- Optimize images (compress, correct format)
- Use production build for testing

### Backend
- Enable compression middleware
- Cache frequently accessed data
- Use appropriate rate limiting
- Optimize file I/O operations

## Additional Resources

- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/
- Express Documentation: https://expressjs.com/
- React Router: https://reactrouter.com/
- i18next: https://www.i18next.com/
- Axios: https://axios-http.com/
- Node.js Documentation: https://nodejs.org/docs/
