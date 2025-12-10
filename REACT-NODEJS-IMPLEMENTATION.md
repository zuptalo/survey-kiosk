# React + Node.js Implementation Guide

## Overview

This branch contains a new implementation of the Survey Kiosk using:
- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **State Management**: React Hooks (useState, useContext)
- **Routing**: React Router v6
- **Internationalization**: i18next
- **Styling**: CSS Modules / Inline styles matching Dream Dose theme

## Current Status

### ✅ Completed

#### Backend (`/backend`)
- ✅ Express server with all API endpoints
- ✅ Survey CRUD operations
- ✅ Response submission and tracking
- ✅ Admin authentication with sessions
- ✅ Image upload handling (base64)
- ✅ Duplicate survey functionality
- ✅ Reset survey ratings
- ✅ Results/statistics calculation
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Environment variable support

**API Endpoints:**
```
Public:
- GET    /api/surveys              - List all surveys
- GET    /api/surveys/:id          - Get single survey
- POST   /api/surveys/:id/submit   - Submit response

Admin (requires authentication):
- POST   /api/admin/login          - Admin login
- POST   /api/admin/logout         - Admin logout
- GET    /api/admin/status         - Check auth status
- POST   /api/admin/surveys        - Create survey
- PUT    /api/admin/surveys/:id    - Update survey
- DELETE /api/admin/surveys/:id    - Delete survey
- POST   /api/admin/surveys/:id/duplicate - Duplicate survey
- POST   /api/admin/surveys/:id/reset     - Reset ratings
- GET    /api/admin/surveys/:id/results   - Get results
```

#### Frontend Structure (`/frontend`)
- ✅ Vite configuration with proxy
- ✅ React project structure
- ✅ Package.json with dependencies

### 🚧 To Be Implemented

The following React components and features need to be created:

#### 1. Core Application Files
```
frontend/src/
├── App.jsx                 - Main app with routing
├── index.css              - Global styles (Dream Dose theme)
├── i18n.js                - i18next configuration (EN/SV)
```

#### 2. API Service Layer
```
frontend/src/services/
├── api.js                 - Axios instance with interceptors
├── surveyService.js       - Survey API calls
├── adminService.js        - Admin API calls
```

#### 3. Authentication Context
```
frontend/src/context/
└── AuthContext.jsx        - Admin auth state management
```

#### 4. Pages
```
frontend/src/pages/
├── Home.jsx              - Landing page
├── SurveyList.jsx        - List of available surveys
├── SurveyForm.jsx        - Main survey tile grid
├── AdminLogin.jsx        - Admin authentication
├── AdminDashboard.jsx    - Admin survey management
├── AdminNewSurvey.jsx    - Create new survey
├── AdminEditSurvey.jsx   - Edit existing survey
└── AdminResults.jsx      - View survey results
```

#### 5. Components
```
frontend/src/components/
├── LanguageSwitcher.jsx  - EN/SV flag toggle
├── TileGrid.jsx          - Survey tiles grid
├── Tile.jsx              - Individual tile component
├── ThankYou.jsx          - Thank you with countdown
├── SurveyItem.jsx        - Survey list item
├── StatsTable.jsx        - Results statistics table
├── ProgressBar.jsx       - Progress visualization
└── ProtectedRoute.jsx    - Auth guard for admin routes
```

#### 6. Hooks
```
frontend/src/hooks/
├── useAuth.js            - Authentication hook
├── useCountdown.js       - Countdown timer
└── useLocalStorage.js    - Persistent state
```

#### 7. Utilities
```
frontend/src/utils/
├── imageUtils.js         - Image to base64 conversion
└── constants.js          - App constants
```

#### 8. Static Assets
```
frontend/public/
├── manifest.json         - PWA manifest (copy from ../static/)
└── icon.png              - App icon (copy from ../static/)
```

## Implementation Steps

### Step 1: Set up the Frontend

1. **Copy static assets:**
```bash
cp static/icon.png frontend/public/
cp static/manifest.json frontend/public/
```

2. **Install dependencies:**
```bash
cd frontend
npm install
```

3. **Create i18n configuration** (`src/i18n.js`):
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "take_survey": "Take a Survey",
      "admin_login": "Admin Login",
      // ... add all translations
    }
  },
  sv: {
    translation: {
      "welcome": "Välkommen",
      "take_survey": "Ta en undersökning",
      "admin_login": "Admin Inloggning",
      // ... add all translations
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

4. **Create global styles** (`src/index.css`):
```css
:root {
  --primary-brown: #3d2817;
  --dark-brown: #1a0c00;
  --medium-brown: #6b4423;
  --light-brown: #a67c52;
  --cream: #f5f0e8;
  --beige: #e8dcc8;
  --accent-blue: #406497;
  --text-dark: #2c1810;
  --text-light: #6b5d54;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, var(--light-brown) 0%, var(--medium-brown) 100%);
  min-height: 100vh;
}

/* Add all other styles from base.html and survey_form.html */
```

5. **Create API service** (`src/services/api.js`):
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

6. **Create App.jsx** with routing:
```javascript
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import pages
import Home from './pages/Home';
import SurveyList from './pages/SurveyList';
import SurveyForm from './pages/SurveyForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
// ... other imports

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/survey/:id" element={<SurveyForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        {/* Add other routes */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

### Step 2: Set up the Backend

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start backend server:**
```bash
npm run dev  # Development with nodemon
# OR
npm start    # Production
```

Backend will run on `http://localhost:3001`

### Step 3: Development Workflow

1. **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

The Vite proxy will forward API requests to the backend automatically.

### Step 4: Key Implementation Details

#### Survey Form Component
- Use the TileGrid component with responsive grid layout
- Implement multi-select with useState
- Add 10-second countdown after submission
- Auto-reset functionality
- Language switcher with flag icons

#### Admin Dashboard
- List all surveys
- CRUD operations
- Duplicate and reset functionality
- Results visualization

#### Authentication
- Store admin state in React Context
- Protect admin routes with ProtectedRoute component
- Session-based auth on backend

#### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Stack layouts on mobile
- Transform tables to cards on mobile

## Docker Configuration

### Dockerfile (Multi-stage build)
```dockerfile
# Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3001

CMD ["node", "server.js"]
```

### docker-compose.yaml
```yaml
services:
  survey-kiosk-react:
    build: .
    container_name: survey-kiosk-react
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
      - SESSION_SECRET=${SESSION_SECRET}
    restart: unless-stopped
```

## Testing

1. **Test backend API:**
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/surveys
```

2. **Test frontend:**
- Open `http://localhost:5173`
- Navigate through all pages
- Test survey submission
- Test admin login and CRUD operations

## Migration from Flask Version

All data from the Flask version is compatible:
- `data/surveys.json` - same format
- `data/responses.json` - same format
- `data/images/` - same image files

Simply mount the same data directory in Docker.

## Next Steps

1. Implement all React components listed above
2. Add comprehensive error handling
3. Implement loading states
4. Add form validation
5. Create unit tests
6. Optimize bundle size
7. Add service worker for PWA
8. Update GitHub Actions for React build

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [React Router](https://reactrouter.com/)
- [i18next](https://www.i18next.com/)
