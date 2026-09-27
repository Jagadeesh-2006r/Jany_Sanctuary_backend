import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  source: {
    type: String,
    default: 'Miss You Button / Voice SOS',
    trim: true,
  },
  note: {
    type: String,
    default: 'Jany triggered emergency comfort connection',
    trim: true,
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
  },
});

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

export default SOSAlert;
