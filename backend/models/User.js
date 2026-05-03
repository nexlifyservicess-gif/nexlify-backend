// models/User.js   — full corrected file

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    select: true
  },
  role: { 
    type: String, 
    enum: ['admin'], 
    default: 'admin' 
  },
  refreshToken: String,
}, { timestamps: true });

// ───── Modern async pre-save (no next parameter) ─────
userSchema.pre('save', async function () {
  // 'this' is the document
  if (!this.isModified('password')) {
    return;           // just return — mongoose continues
  }

  try {
    this.password = await bcrypt.hash(this.password, 12);
    // no next() needed — promise resolution = continue
  } catch (err) {
    throw err;        // throw = stop + error to caller (seed.js will see it)
    // or: return Promise.reject(err);  ← also fine
  }
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
module.exports = mongoose.model('User', userSchema);