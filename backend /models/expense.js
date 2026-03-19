// backend/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    // optional: maxlength: 500,
  },
  date: {
    type: Date,
    required: true,
    // optional: default: Date.now  (if you want auto-set to now)
  },
}, {
  timestamps: true, // adds createdAt & updatedAt automatically
});

// Index for fast queries: user + date descending (recent first)
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

