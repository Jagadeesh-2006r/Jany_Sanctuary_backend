import express from 'express';
import {
  saveResponse,
  logMood,
  getAppaVaultData,
  getMessages,
  markMessageAsRead,
  getMoods,
  getSOSAlerts,
  logSOSAlert,
} from '../controllers/responseController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Jany Sanctuary Backend API is healthy and active',
    timestamp: new Date().toISOString(),
  });
});

// Save Jany's 3 answers
router.post('/save-response', saveResponse);

// Log mood and receive comforting fatherly message
router.post('/log-mood', logMood);

// Appa Vault: Fetch all responses and mood history (newest first)
router.get('/appa-vault', getAppaVaultData);

// Confidential Messages endpoints for Appa's Private Monitoring Desk
router.get('/messages', getMessages);
router.patch('/messages/:id/read', markMessageAsRead);

// Mood logs endpoint
router.get('/moods', getMoods);

// SOS Alerts endpoints
router.get('/sos-alerts', getSOSAlerts);
router.post('/sos-alerts', logSOSAlert);

export default router;
