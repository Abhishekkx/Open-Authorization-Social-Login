const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'link', 'unlink', 'failed_login', 'token_refresh']
  },
  provider: {
    type: String,
    enum: ['google', 'facebook', 'jwt']
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  ipAddress: String,
  userAgent: String,
  correlationId: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
authLogSchema.index({ userId: 1, createdAt: -1 });
authLogSchema.index({ correlationId: 1 });
authLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

module.exports = mongoose.model('AuthLog', authLogSchema);
