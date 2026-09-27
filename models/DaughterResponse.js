import mongoose from 'mongoose';

const daughterResponseSchema = new mongoose.Schema({
  daughterName: {
    type: String,
    default: 'Jaganya J (Jany)',
  },
  q1_feeling: {
    type: String,
    required: [true, 'Please share how you are feeling'],
    trim: true,
  },
  q2_miss_memory: {
    type: String,
    required: [true, 'Please share the memory you miss the most'],
    trim: true,
  },
  q3_message_to_appa: {
    type: String,
    required: [true, 'Please leave your message for Appa'],
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
});

const DaughterResponse = mongoose.model('DaughterResponse', daughterResponseSchema);

export default DaughterResponse;
