// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// ─── Controller Imports ───────────────────────────────────────────────────────
const { register }    = require('./controllers/register');
const { login }       = require('./controllers/login');
const { refresh }     = require('./controllers/authController');
const { updateBudget }= require('./controllers/updatebudgetcontroller');
const { getSummary }  = require('./controllers/summarybudgetcontroller');

// ─── Middleware Imports ───────────────────────────────────────────────────────
const authMiddleware  = require('./middleware/auth');

// ─── Expense Model (for direct route use) ────────────────────────────────────
const Expense = require('./models/Expense');

// ─── App Init ─────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,   // required so the browser sends/receives httpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());   // needed to read req.cookies.refreshToken

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Auth Routes (public) ─────────────────────────────────────────────────────
app.post('/api/auth/register', register);
app.post('/api/auth/login',    login);
app.post('/api/auth/refresh',  refresh);   // uses httpOnly cookie, no auth header needed

// Logout — clears the refresh token cookie and removes it from DB
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove token from DB so it can't be reused
      const User = require('./models/User');
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    // Clear the cookie regardless
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// ─── Budget Routes (protected) ────────────────────────────────────────────────
app.put('/api/budget',         authMiddleware, updateBudget);   // set/update monthly budget
app.get('/api/budget/summary', authMiddleware, getSummary);     // ?month=YYYY-MM (optional)

// ─── Expense Routes (protected) ───────────────────────────────────────────────

// GET /api/expenses — list all expenses for the logged-in user
// Optional query params: ?month=YYYY-MM  &category=Food  &page=1  &limit=20
app.get('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const { month, category, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user.id };

    // Optional: filter by month
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(mon) || mon < 1 || mon > 12) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }
      filter.date = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59, 999),
      };
    }

    // Optional: filter by category
    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      expenses,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
});

// POST /api/expenses — add a new expense
app.post('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }

    const expense = new Expense({
      userId: req.user.id,
      amount,
      category: category.trim(),
      description: description?.trim(),
      date: new Date(date),
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Server error adding expense' });
  }
});

// GET /api/expenses/:id — get a single expense
app.get('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id:    req.params.id,
      userId: req.user.id,    // ensures users can only access their own
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server error fetching expense' });
  }
});

// PUT /api/expenses/:id — update an expense
app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }

    const updates = {};
    if (amount      !== undefined) updates.amount      = amount;
    if (category    !== undefined) updates.category    = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (date        !== undefined) updates.date        = new Date(date);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error updating expense' });
  }
});

// DELETE /api/expenses/:id — delete an expense
app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error deleting expense' });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// ─── MongoDB Connection + Server Start ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
