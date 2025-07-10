const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isGuest;
    },
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: function() {
      // Generate a random color for user identification
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    fontSize: {
      type: Number,
      default: 14
    },
    autoSave: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isGuest) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isGuest) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Index for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ lastActive: -1 });

module.exports = mongoose.model('User', UserSchema);