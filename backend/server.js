import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

// Trust proxy - required when running behind reverse proxy (nginx, etc.)
// This enables Express to trust X-Forwarded-* headers
app.set('trust proxy', 1);

// Data directories
const DATA_DIR = path.join(__dirname, 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

// Ensure directories exist
await fs.mkdir(DATA_DIR, { recursive: true });
await fs.mkdir(IMAGES_DIR, { recursive: true });

// Middleware
// CORS is only needed in development when frontend runs on a different port
// In production, frontend is served from the same origin (no CORS needed)
if (process.env.NODE_ENV !== 'production') {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow any local network IP
      const localNetworkRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d+$/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  };

  app.use(cors(corsOptions));
  console.log('CORS enabled for development');
} else {
  // Production: No CORS needed - frontend served from same origin
  console.log('CORS disabled - serving frontend from same origin');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
// NOTE: Using MemoryStore (default) for simplicity. For production with multiple
// instances or high traffic, consider using a persistent session store like:
// - connect-redis: https://www.npmjs.com/package/connect-redis
// - connect-mongo: https://www.npmjs.com/package/connect-mongo
// - express-session-level: https://www.npmjs.com/package/express-session-level
app.use(session({
  secret: SESSION_SECRET,
  resave: true, // Changed to true to ensure session is always saved
  saveUninitialized: false,
  name: 'survey.sid',
  proxy: true, // Trust proxy headers
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: undefined // Don't set domain to allow cookies to work on any host
  },
  rolling: true, // Reset expiration on every request
  unset: 'keep' // Keep session even if properties are deleted
}));

// Serve static files
app.use('/images', express.static(IMAGES_DIR));

// Serve frontend static files (built React app)
const FRONTEND_DIR = path.join(__dirname, 'public');
app.use(express.static(FRONTEND_DIR));

// Debug middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.path.includes('/admin/')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
        sessionID: req.sessionID,
        hasAdmin: !!req.session?.admin,
        origin: req.headers.origin,
        hasCookie: !!req.headers.cookie
      });
    }
    next();
  });
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  skip: (req) => {
    // Skip rate limiting for development
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    return false;
  }
});
app.use(limiter);

// Helper functions
async function loadSurveys() {
  try {
    const data = await fs.readFile(SURVEYS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveSurveys(surveys) {
  await fs.writeFile(SURVEYS_FILE, JSON.stringify(surveys, null, 2));
}

async function loadResponses() {
  try {
    const data = await fs.readFile(RESPONSES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveResponses(responses) {
  await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

async function updateSurveyFirstResponse(surveyId) {
  const surveys = await loadSurveys();
  const survey = surveys.find(s => s.id === surveyId);
  if (survey && !survey.first_response_at) {
    survey.first_response_at = new Date().toISOString();
    await saveSurveys(surveys);
  }
}

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session) {
    console.error('Session middleware not working - no session object');
    return res.status(500).json({ error: 'Session configuration error' });
  }

  if (!req.session.admin) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Unauthorized access attempt:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        admin: req.session.admin,
        cookie: req.headers.cookie,
        origin: req.headers.origin
      });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get client configuration
app.get('/api/config', (req, res) => {
  res.json({
    thankYouCountdown: parseInt(process.env.THANK_YOU_COUNTDOWN) || 5,
    inactivityTimeout: parseInt(process.env.INACTIVITY_TIMEOUT) || 30
  });
});

// Get all surveys (public)
app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await loadSurveys();
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load surveys' });
  }
});

// Get single survey (public)
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const surveys = await loadSurveys();
    let survey = surveys.find(s => s.id === req.params.id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Backward compatibility: convert old format (flat items) to new format (questions)
    if (survey.items && !survey.questions) {
      survey = {
        ...survey,
        questions: [{
          id: 'q1',
          text_en: survey.title_en || '',
          text_sv: survey.title_sv || '',
          selection_mode: 'multiple',
          items: survey.items
        }]
      };
    }

    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load survey' });
  }
});

// Submit survey response (public)
app.post('/api/surveys/:id/submit', async (req, res) => {
  try {
    const { selected_items, responses: questionResponses } = req.body;

    // Support both old format (selected_items) and new format (responses)
    let responseData;
    if (questionResponses && Array.isArray(questionResponses)) {
      // New format: multi-question responses
      responseData = {
        survey_id: req.params.id,
        responses: questionResponses,
        timestamp: new Date().toISOString()
      };
    } else if (selected_items && Array.isArray(selected_items)) {
      // Old format: backward compatibility
      responseData = {
        survey_id: req.params.id,
        selected_items: selected_items,
        timestamp: new Date().toISOString()
      };
    } else {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const responses = await loadResponses();
    responses.push(responseData);

    await saveResponses(responses);
    await updateSurveyFirstResponse(req.params.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }

      req.session.admin = true;

      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }
        res.json({ success: true });
      });
    });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('survey.sid');
    res.json({ success: true });
  });
});

// Check auth status
app.get('/api/admin/status', (req, res) => {
  const isAuthenticated = !!req.session?.admin;

  if (process.env.NODE_ENV === 'development') {
    console.log('Auth status check:', {
      authenticated: isAuthenticated,
      sessionId: req.sessionID,
      hasSession: !!req.session
    });
  }

  res.json({ authenticated: isAuthenticated });
});

// Create survey (admin)
app.post('/api/admin/surveys', requireAuth, async (req, res) => {
  try {
    const { title_en, title_sv, description_en, description_sv, items, questions } = req.body;

    const surveys = await loadSurveys();
    const surveyId = String(surveys.length + 1);

    const survey = {
      id: surveyId,
      title_en,
      title_sv,
      description_en,
      description_sv,
      created_at: new Date().toISOString(),
      first_response_at: null
    };

    // Handle new format (questions) or old format (items)
    if (questions && Array.isArray(questions)) {
      // New format: questions with items
      const processedQuestions = [];
      for (const question of questions) {
        const processedItems = [];
        for (const item of question.items || []) {
          const processedItem = {
            id: item.id,
            text_en: item.text_en || item.text || '',
            text_sv: item.text_sv || ''
          };

          if (item.imageData) {
            const buffer = Buffer.from(item.imageData, 'base64');
            const imagePath = path.join(IMAGES_DIR, item.image);
            await fs.writeFile(imagePath, buffer);
            processedItem.image = item.image;
          }

          processedItems.push(processedItem);
        }

        processedQuestions.push({
          id: question.id,
          text_en: question.text_en || '',
          text_sv: question.text_sv || '',
          selection_mode: question.selection_mode || 'multiple',
          items: processedItems
        });
      }
      survey.questions = processedQuestions;
    } else if (items && Array.isArray(items)) {
      // Old format: backward compatibility
      const processedItems = [];
      for (const item of items) {
        const processedItem = {
          id: item.id,
          text_en: item.text_en || item.text || '',
          text_sv: item.text_sv || ''
        };

        if (item.imageData) {
          const buffer = Buffer.from(item.imageData, 'base64');
          const imagePath = path.join(IMAGES_DIR, item.image);
          await fs.writeFile(imagePath, buffer);
          processedItem.image = item.image;
        }

        processedItems.push(processedItem);
      }
      survey.items = processedItems;
    }

    surveys.push(survey);
    await saveSurveys(surveys);

    res.json({ success: true, survey_id: surveyId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// Update survey (admin)
app.put('/api/admin/surveys/:id', requireAuth, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('PUT /admin/surveys/:id - Session before update:', {
        sessionID: req.sessionID,
        admin: req.session.admin
      });
    }

    const { title_en, title_sv, description_en, description_sv, items, questions } = req.body;

    const surveys = await loadSurveys();
    const survey = surveys.find(s => s.id === req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    survey.title_en = title_en;
    survey.title_sv = title_sv;
    survey.description_en = description_en;
    survey.description_sv = description_sv;

    // Handle new format (questions) or old format (items)
    if (questions && Array.isArray(questions)) {
      // New format: questions with items
      const processedQuestions = [];
      for (const question of questions) {
        const processedItems = [];
        for (const item of question.items || []) {
          const processedItem = {
            id: item.id,
            text_en: item.text_en || item.text || '',
            text_sv: item.text_sv || ''
          };

          if (item.image && !item.imageData) {
            processedItem.image = item.image;
          }

          if (item.imageData) {
            const buffer = Buffer.from(item.imageData, 'base64');
            const imagePath = path.join(IMAGES_DIR, item.image);
            await fs.writeFile(imagePath, buffer);
            processedItem.image = item.image;
          }

          processedItems.push(processedItem);
        }

        processedQuestions.push({
          id: question.id,
          text_en: question.text_en || '',
          text_sv: question.text_sv || '',
          selection_mode: question.selection_mode || 'multiple',
          items: processedItems
        });
      }
      survey.questions = processedQuestions;
      // Remove old items array if present
      delete survey.items;
    } else if (items && Array.isArray(items)) {
      // Old format: backward compatibility
      const processedItems = [];
      for (const item of items) {
        const processedItem = {
          id: item.id,
          text_en: item.text_en || item.text || '',
          text_sv: item.text_sv || ''
        };

        if (item.image && !item.imageData) {
          processedItem.image = item.image;
        }

        if (item.imageData) {
          const buffer = Buffer.from(item.imageData, 'base64');
          const imagePath = path.join(IMAGES_DIR, item.image);
          await fs.writeFile(imagePath, buffer);
          processedItem.image = item.image;
        }

        processedItems.push(processedItem);
      }
      survey.items = processedItems;
      // Remove questions array if present
      delete survey.questions;
    }

    await saveSurveys(surveys);

    // Touch the session to ensure it's kept alive
    req.session.touch();

    if (process.env.NODE_ENV === 'development') {
      console.log('PUT /admin/surveys/:id - Session after update:', {
        sessionID: req.sessionID,
        admin: req.session.admin
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// Delete survey (admin)
app.delete('/api/admin/surveys/:id', requireAuth, async (req, res) => {
  try {
    const surveys = await loadSurveys();
    const survey = surveys.find(s => s.id === req.params.id);

    if (survey) {
      // Delete images
      for (const item of survey.items) {
        if (item.image) {
          const imagePath = path.join(IMAGES_DIR, item.image);
          try {
            await fs.unlink(imagePath);
          } catch (error) {
            // Image might not exist, continue
          }
        }
      }

      // Remove survey
      const updatedSurveys = surveys.filter(s => s.id !== req.params.id);
      await saveSurveys(updatedSurveys);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// Duplicate survey (admin)
app.post('/api/admin/surveys/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const { new_title_en, new_title_sv } = req.body;
    const surveys = await loadSurveys();
    const survey = surveys.find(s => s.id === req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const newSurveyId = String(Math.max(...surveys.map(s => parseInt(s.id))) + 1);

    // Copy items and duplicate images
    const newItems = [];
    for (let i = 0; i < survey.items.length; i++) {
      const item = survey.items[i];
      const newItem = {
        id: `${newSurveyId}_${item.id}`,
        text_en: item.text_en || item.text || '',
        text_sv: item.text_sv || ''
      };

      if (item.image) {
        const oldImagePath = path.join(IMAGES_DIR, item.image);
        const extension = path.extname(item.image);
        const newImageName = `${newSurveyId}_${i}_${Date.now()}${extension}`;
        const newImagePath = path.join(IMAGES_DIR, newImageName);

        try {
          await fs.copyFile(oldImagePath, newImagePath);
          newItem.image = newImageName;
        } catch (error) {
          // Image copy failed, continue without image
        }
      }

      newItems.push(newItem);
    }

    const newSurvey = {
      id: newSurveyId,
      title_en: new_title_en,
      title_sv: new_title_sv,
      description_en: survey.description_en,
      description_sv: survey.description_sv,
      items: newItems,
      created_at: new Date().toISOString(),
      first_response_at: null
    };

    surveys.push(newSurvey);
    await saveSurveys(surveys);

    res.json({ success: true, survey_id: newSurveyId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to duplicate survey' });
  }
});

// Reset survey ratings (admin)
app.post('/api/admin/surveys/:id/reset', requireAuth, async (req, res) => {
  try {
    const surveys = await loadSurveys();
    const survey = surveys.find(s => s.id === req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Remove all responses for this survey
    const responses = await loadResponses();
    const updatedResponses = responses.filter(r => r.survey_id !== req.params.id);
    await saveResponses(updatedResponses);

    // Reset first_response_at
    survey.first_response_at = null;
    await saveSurveys(surveys);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset survey' });
  }
});

// Get survey results (admin)
app.get('/api/admin/surveys/:id/results', requireAuth, async (req, res) => {
  try {
    const surveys = await loadSurveys();
    const survey = surveys.find(s => s.id === req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const responses = await loadResponses();
    const surveyResponses = responses.filter(r => r.survey_id === req.params.id);

    const totalResponses = surveyResponses.length;

    // Calculate statistics
    const itemStats = survey.items.map(item => {
      const count = surveyResponses.filter(r =>
        r.selected_items.includes(item.id)
      ).length;

      const percentage = totalResponses > 0
        ? Math.round((count / totalResponses) * 1000) / 10
        : 0;

      return {
        id: item.id,
        text_en: item.text_en || item.text || '',
        text_sv: item.text_sv || '',
        image: item.image || '',
        count,
        percentage
      };
    });

    // Sort by count descending
    itemStats.sort((a, b) => b.count - a.count);

    // Calculate average selections per response
    const totalSelections = surveyResponses.reduce((sum, r) => sum + r.selected_items.length, 0);
    const avgSelections = totalResponses > 0 ? totalSelections / totalResponses : 0;

    // Find all items with the highest score (handle ties)
    const mostSelected = [];
    if (itemStats.length > 0 && itemStats[0].count > 0) {
      const highestCount = itemStats[0].count;
      // Get all items that have the same highest count
      for (const stat of itemStats) {
        if (stat.count === highestCount) {
          mostSelected.push({
            id: stat.id,
            text_en: stat.text_en,
            text_sv: stat.text_sv,
            image: stat.image,
            count: stat.count,
            percentage: stat.percentage
          });
        } else {
          break; // Since items are sorted, we can stop once we find a lower count
        }
      }
    }

    res.json({
      survey,
      stats: {
        total_responses: totalResponses,
        avg_selections: avgSelections,
        item_stats: itemStats.map(stat => ({
          item_id: stat.id,
          text_en: stat.text_en,
          text_sv: stat.text_sv,
          image: stat.image,
          count: stat.count,
          percentage: stat.percentage
        })),
        most_selected: mostSelected.length > 0 ? mostSelected : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load results' });
  }
});

// Fallback route - serve index.html for client-side routing
// This must be after all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('Survey Kiosk Backend API');
  console.log('='.repeat(50));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
  console.log(`Data Directory: ${DATA_DIR}`);
  console.log('='.repeat(50) + '\n');
});
