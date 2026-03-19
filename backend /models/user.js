user.js
// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,           // fixed typo: minlength, not mainlength
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // basic email format check
  },
  password: {
    type: String,
    required: true,
    minlength: 8,           // fixed typo
    select: false,          // never return password in find/query results
  },
  monthlyBudget: {
    type: Number,
    default: 0,
  },
  refreshTokens: [
    {
      token: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
  ],
}, { timestamps: true });
// IMPORTANT: Hash password AUTOMATICALLY only when it's changed
userSchema.pre('save', async function (next) {
  // Step 1: Skip if password wasn't modified (e.g. only name/email changed)
  if (!this.isModified('password')) {
    return next(); // continue saving without touching password
  }
  // Step 2: Only now do the expensive hashing
  try {
    const salt = await bcrypt.genSalt(12);                  // random salt per user
    this.password = await bcrypt.hash(this.password, salt); // one-way hash
    next();                                                 // save the document
  } catch (err) {
    next(err); // if bcrypt fails (very rare), pass error to Mongoose
  }
});
// Custom method you can call on any user document
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
  // returns true/false — safe against timing attacks
};
module.exports = mongoose.model('User', userSchema);
