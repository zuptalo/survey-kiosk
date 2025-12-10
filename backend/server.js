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

// Data directories
const DATA_DIR = path.join(__dirname, 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

// Ensure directories exist
await fs.mkdir(DATA_DIR, { recursive: true });
await fs.mkdir(IMAGES_DIR, { recursive: true });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use('/images', express.static(IMAGES_DIR));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
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
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    const survey = surveys.find(s => s.id === req.params.id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load survey' });
  }
});

// Submit survey response (public)
app.post('/api/surveys/:id/submit', async (req, res) => {
  try {
    const { selectedItems } = req.body;

    if (!selectedItems || !Array.isArray(selectedItems)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const responses = await loadResponses();
    responses.push({
      survey_id: req.params.id,
      selected_items: selectedItems,
      timestamp: new Date().toISOString()
    });

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
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/admin/status', (req, res) => {
  res.json({ authenticated: !!req.session.admin });
});

// Create survey (admin)
app.post('/api/admin/surveys', requireAuth, async (req, res) => {
  try {
    const { title_en, title_sv, description_en, description_sv, items } = req.body;

    const surveys = await loadSurveys();
    const surveyId = String(surveys.length + 1);

    // Process items and save images
    const processedItems = [];
    for (const item of items) {
      const processedItem = {
        id: item.id,
        text: item.text || ''
      };

      if (item.imageData) {
        const buffer = Buffer.from(item.imageData, 'base64');
        const imagePath = path.join(IMAGES_DIR, item.image);
        await fs.writeFile(imagePath, buffer);
        processedItem.image = item.image;
      }

      processedItems.push(processedItem);
    }

    const survey = {
      id: surveyId,
      title_en,
      title_sv,
      description_en,
      description_sv,
      items: processedItems,
      created_at: new Date().toISOString(),
      first_response_at: null
    };

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
    const { title_en, title_sv, description_en, description_sv, items } = req.body;

    const surveys = await loadSurveys();
    const survey = surveys.find(s => s.id === req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Process items and save images
    const processedItems = [];
    for (const item of items) {
      const processedItem = {
        id: item.id,
        text: item.text || ''
      };

      if (item.existing_image) {
        processedItem.image = item.existing_image;
      }

      if (item.imageData) {
        const buffer = Buffer.from(item.imageData, 'base64');
        const imagePath = path.join(IMAGES_DIR, item.image);
        await fs.writeFile(imagePath, buffer);
        processedItem.image = item.image;
      }

      processedItems.push(processedItem);
    }

    survey.title_en = title_en;
    survey.title_sv = title_sv;
    survey.description_en = description_en;
    survey.description_sv = description_sv;
    survey.items = processedItems;

    await saveSurveys(surveys);

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
        text: item.text || ''
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
        text: item.text || '',
        image: item.image || '',
        count,
        percentage
      };
    });

    // Sort by count descending
    itemStats.sort((a, b) => b.count - a.count);

    res.json({
      survey,
      itemStats,
      totalResponses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load results' });
  }
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
