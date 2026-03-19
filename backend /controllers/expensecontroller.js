// backend/controllers/expenseController.js
const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const { month, category, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user.id };

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
};

exports.addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }

    const expense = new Expense({
      userId:      req.user.id,
      amount,
      category:    category.trim(),
      description: description?.trim(),
      date:        new Date(date),
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Server error adding expense' });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server error fetching expense' });
  }
};

exports.updateExpense = async (req, res) => {
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
};

exports.deleteExpense = async (req, res) => {
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
};
