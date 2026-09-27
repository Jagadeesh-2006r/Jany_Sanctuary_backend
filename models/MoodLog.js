import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  mood: {
    type: String,
    required: [true, 'Mood status is required'],
    trim: true,
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
});

const MoodLog = mongoose.model('MoodLog', moodLogSchema);

export default MoodLog;
