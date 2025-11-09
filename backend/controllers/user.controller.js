const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const { logger } = require('../utils/logger');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.info('Profile updated', {
      userId: user._id,
      correlationId: req.correlationId
    });

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Profile update error', {
      error: error.message,
      userId: req.user._id,
      correlationId: req.correlationId
    });

    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Link provider account
exports.linkProvider = async (req, res) => {
  try {
    const { provider } = req.params;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Store user ID in session for linking
    req.session = req.session || {};
    req.session.linkingUserId = req.user._id.toString();

    // Redirect to OAuth flow
    const redirectUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/${provider}?link=true`;
    res.json({ redirectUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate linking' });
  }
};

// Unlink provider account
exports.unlinkProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    const user = req.user;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Check if user has at least one other provider
    if (user.providers.length <= 1) {
      return res.status(400).json({ 
        error: 'Cannot unlink last authentication method' 
      });
    }

    const providerKey = `${provider}Id`;

    if (!user[providerKey]) {
      return res.status(400).json({ error: 'Provider not linked' });
    }

    // Remove provider
    user[providerKey] = undefined;
    user.providers = user.providers.filter(p => p !== provider);
    await user.save();

    await AuthLog.create({
      userId: user._id,
      action: 'unlink',
      provider,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('Provider unlinked', {
      userId: user._id,
      provider,
      correlationId: req.correlationId
    });

    res.json({ user, message: `${provider} account unlinked successfully` });
  } catch (error) {
    logger.error('Unlink provider error', {
      error: error.message,
      userId: req.user._id,
      correlationId: req.correlationId
    });

    res.status(500).json({ error: 'Failed to unlink provider' });
  }
};

// Get auth logs
exports.getAuthLogs = async (req, res) => {
  try {
    const logs = await AuthLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v');

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get auth logs' });
  }
};
