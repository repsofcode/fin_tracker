
// Example: in authController.js or userController.js
const User = require('../models/User');
exports.updateBudget = async (req, res) => {
  try {
    const { budget } = req.body;
    // Validation
    if (budget === undefined || typeof budget !== 'number') {
      return res.status(400).json({ error: 'Budget must be a number' });
    }
    if (budget < 0) {
      return res.status(400).json({ error: 'Budget cannot be negative' });
    }
    // Update logged-in user's monthly budget
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { monthlyBudget: budget },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens'); // exclude sensitive fields
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      message: 'Monthly budget updated successfully',
      budget: user.monthlyBudget,
      // optional: return more info
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Server error while updating budget' });
  }
};
