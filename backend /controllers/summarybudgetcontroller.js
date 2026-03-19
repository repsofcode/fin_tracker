// backend/controllers/summarybudgetcontroller.js
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const User = require('../models/User');

exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query; // optional ?month=2026-03
    // Determine month & year (default: current month)
    let year, mon;
    if (month) {
      [year, mon] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(mon) || mon < 1 || mon > 12) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }
    } else {
      const now = new Date();
      year = now.getFullYear();
      mon = now.getMonth() + 1; // JS months are 0-based
    }
    // Date range for the month
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);
    // 1. Get user's current monthly budget
    const user = await User.findById(req.user.id).select('monthlyBudget name email');
    const budget = user?.monthlyBudget || 0;
    // 2. Aggregate total expenses for the user in this month
    const aggResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);
    const totalExpenses = aggResult.length > 0 ? aggResult[0].totalExpenses : 0;
    // 3. Calculate remaining & financial status
    const remaining = budget - totalExpenses;
    let status;
    if (remaining >= budget * 0.3) {
      status = 'Comfortable';
    } else if (remaining >= budget * 0.1) {
      status = 'Tight';
    } else if (remaining >= 0) {
      status = 'Difficult';
    } else {
      status = 'Overspending';
    }
    // 4. Format month string (YYYY-MM)
    const monthStr = `${year}-${String(mon).padStart(2, '0')}`;
    // 5. Response
    res.status(200).json({
      month: monthStr,
      budget,
      totalExpenses,
      remaining,
      status,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error generating summary' });
  }
};
