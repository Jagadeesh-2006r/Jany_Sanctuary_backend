import DaughterResponse from '../models/DaughterResponse.js';
import MoodLog from '../models/MoodLog.js';
import SOSAlert from '../models/SOSAlert.js';

// Pre-defined father comforting voice messages mapped to moods
const APPA_COMFORT_MESSAGES = {
  sad: 'Kavala padadha da Jany, un appa un koodave dhaan irukken. Everything will be alright da chellam.',
  missing_appa: 'Un appa unna oru nodi kooda marakala da. Oru missed call kudu, un munnadi nippan.',
  stressed: 'Take a deep breath da kannamma. En princess romba strong, unnala mudiyum.',
  happy: 'Un sirippu dhaan en ulagam da Jany! Eppovum ipdiye sandhosham-a iru da.',
};

const DEFAULT_COMFORT_MESSAGE = 'Appa eppovum un koodave irukken da chellam. Love you always!';

/**
 * @desc   Save Jany's 3 answers to DaughterResponse
 * @route  POST /api/save-response
 */
export const saveResponse = async (req, res) => {
  try {
    const { daughterName, q1_feeling, q2_miss_memory, q3_message_to_appa, message, text, content } = req.body || {};

    const feeling = q1_feeling || 'Shared feeling';
    const memory = q2_miss_memory || 'Direct memory';
    const finalMessage = q3_message_to_appa || message || text || content;

    if (!finalMessage && !q1_feeling) {
      return res.status(400).json({
        success: false,
        message: 'Please answer the questions or provide a message for Appa.',
      });
    }

    const newResponse = new DaughterResponse({
      daughterName: daughterName || 'Jaganya J (Jany)',
      q1_feeling: feeling,
      q2_miss_memory: memory,
      q3_message_to_appa: finalMessage || '❤️',
    });

    const savedResponse = await newResponse.save();

    return res.status(201).json({
      success: true,
      message: "Thank you da chellam! Appa received your heart's message ❤️",
      data: savedResponse,
    });
  } catch (error) {
    console.error('Error saving daughter response:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record your message. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc   Log current mood and return immediate comforting father message
 * @route  POST /api/log-mood
 */
export const logMood = async (req, res) => {
  try {
    const { mood, note } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required.',
      });
    }

    const normalizedMood = mood.toLowerCase().trim();
    const comfortingMessage = APPA_COMFORT_MESSAGES[normalizedMood] || DEFAULT_COMFORT_MESSAGE;

    const newMoodLog = new MoodLog({
      mood: normalizedMood,
      note: note || '',
      loggedAt: new Date(),
    });

    const savedMoodLog = await newMoodLog.save();

    return res.status(201).json({
      success: true,
      comfortingMessage,
      data: savedMoodLog,
    });
  } catch (error) {
    console.error('Error logging mood:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log mood. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc   Fetch all responses and mood logs for Appa Vault (newest first)
 * @route  GET /api/appa-vault
 */
export const getAppaVaultData = async (req, res) => {
  try {
    const appaSecretKey = process.env.APPA_KEY || 'janyappa';
    const providedKey = req.headers['x-appa-key'] || req.query.key;

    // Validate key if APPA_KEY is enforced or provided
    if (providedKey && providedKey !== appaSecretKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Appa Vault Key.',
      });
    }

    const [responses, moodLogs, sosAlerts] = await Promise.all([
      DaughterResponse.find().sort({ submittedAt: -1, _id: -1 }).lean(),
      MoodLog.find().sort({ loggedAt: -1, _id: -1 }).lean(),
      SOSAlert.find().sort({ triggeredAt: -1, _id: -1 }).lean(),
    ]);

    return res.status(200).json({
      success: true,
      totalResponses: responses.length,
      totalMoodLogs: moodLogs.length,
      totalSOSAlerts: sosAlerts.length,
      data: {
        responses,
        moodLogs,
        sosAlerts,
      },
    });
  } catch (error) {
    console.error('Error fetching Appa Vault data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vault data.',
      error: error.message,
    });
  }
};

/**
 * @desc   Fetch all confidential daughter responses (newest first)
 * @route  GET /api/messages
 */
export const getMessages = async (req, res) => {
  try {
    const messages = await DaughterResponse.find()
      .sort({ submittedAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch confidential messages.',
      error: error.message,
    });
  }
};

/**
 * @desc   Mark a confidential message as read / hugged
 * @route  PATCH /api/messages/:id/read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await DaughterResponse.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    // Toggle or mark as read
    const newStatus = req.body && typeof req.body.isRead === 'boolean' ? req.body.isRead : !existing.isRead;
    existing.isRead = newStatus;
    existing.readAt = newStatus ? new Date() : null;

    const updated = await existing.save();

    return res.status(200).json({
      success: true,
      message: newStatus ? 'Message marked as Hugged ❤️' : 'Message marked as Unread',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating message read status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update message status.',
      error: error.message,
    });
  }
};

/**
 * @desc   Fetch all logged moods (newest first)
 * @route  GET /api/moods
 */
export const getMoods = async (req, res) => {
  try {
    const moods = await MoodLog.find()
      .sort({ loggedAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: moods.length,
      data: moods,
    });
  } catch (error) {
    console.error('Error fetching moods:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mood history.',
      error: error.message,
    });
  }
};

/**
 * @desc   Fetch all SOS alerts (newest first)
 * @route  GET /api/sos-alerts
 */
export const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .sort({ triggeredAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch SOS alerts.',
      error: error.message,
    });
  }
};

/**
 * @desc   Log a panic / SOS trigger
 * @route  POST /api/sos-alerts
 */
export const logSOSAlert = async (req, res) => {
  try {
    const { source, note } = req.body || {};

    const newAlert = new SOSAlert({
      source: source || 'Whenever You Miss Me Button',
      note: note || 'Emergency comfort alert triggered by Jany',
      triggeredAt: new Date(),
    });

    const saved = await newAlert.save();

    return res.status(201).json({
      success: true,
      message: 'SOS Alert logged successfully.',
      data: saved,
    });
  } catch (error) {
    console.error('Error logging SOS alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record SOS alert.',
      error: error.message,
    });
  }
};

