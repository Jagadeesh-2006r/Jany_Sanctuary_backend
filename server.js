import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder (accessible as /media/* and /*)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'public', 'media')));

// API Routes
app.use('/api', apiRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'Jany Sanctuary API',
    dedicatedTo: 'Jaganya J (Jany)',
    status: 'online',
    endpoints: {
      health: '/api/health',
      saveResponse: 'POST /api/save-response',
      logMood: 'POST /api/log-mood',
      appaVault: 'GET /api/appa-vault',
      media: '/media/:filename',
    },
  });
});

// Database Connection & Server Initialization
const connectDB = async () => {
  if (!MONGO_URI) {
    console.warn('⚠️  MONGO_URI not configured in .env. MongoDB is not connected yet.');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Jany Sanctuary Server running on port ${PORT}`);
    console.log(`📁 Serving media from: ${path.join(__dirname, 'public/media')}`);
  });
});

export default app;
