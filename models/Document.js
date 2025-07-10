const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: String,
    ref: 'User'
  },
  collaborators: [{
    userId: {
      type: String,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'write'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Update lastModified on save
DocumentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Index for better performance
DocumentSchema.index({ owner: 1, createdAt: -1 });
DocumentSchema.index({ 'collaborators.userId': 1 });
DocumentSchema.index({ lastModified: -1 });

module.exports = mongoose.model('Document', DocumentSchema);