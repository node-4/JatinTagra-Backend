const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Penalty = mongoose.model('Penalty', penaltySchema);

module.exports = Penalty;
