const passport = require('passport');
const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies } = require('../utils/jwt');
const { generateState } = require('../utils/pkce');
const { logger } = require('../utils/logger');

// Initiate OAuth login
exports.initiateOAuth = (provider) => async (req, res, next) => {
  const state = generateState();
  const returnTo = req.query.returnTo || '/';

  // Store state and returnTo in cookies
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000 // 10 minutes
  });

  res.cookie('oauth_return_to', returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000
  });

  passport.authenticate(provider, {
    scope: provider === 'google' 
      ? ['profile', 'email']
      : ['email', 'public_profile'],
    state
  })(req, res, next);
};

// OAuth callback handler
exports.oauthCallback = (provider) => [
  passport.authenticate(provider, { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const returnTo = req.cookies.oauth_return_to || '/';

      // Clear OAuth cookies
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_return_to');

      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Store refresh token
      await user.addRefreshToken(refreshToken);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Set auth cookies
      setAuthCookies(res, accessToken, refreshToken);

      // Log successful login
      await AuthLog.create({
        userId: user._id,
        action: 'login',
        provider,
        success: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId
      });

      logger.info('OAuth login successful', {
        userId: user._id,
        provider,
        correlationId: req.correlationId
      });

      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}${returnTo}`);
    } catch (error) {
      logger.error('OAuth callback error', {
        error: error.message,
        provider,
        correlationId: req.correlationId
      });

      await AuthLog.create({
        action: 'login',
        provider,
        success: false,
        errorMessage: error.message,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId
      });

      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
];

// Logout
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (req.user && refreshToken) {
      await req.user.removeRefreshToken(refreshToken);

      await AuthLog.create({
        userId: req.user._id,
        action: 'logout',
        success: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId
      });
    }

    clearAuthCookies(res);

    logger.info('User logged out', {
      userId: req.user?._id,
      correlationId: req.correlationId
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', {
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({ error: 'Logout failed' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = require('../utils/jwt').verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Replace old refresh token
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    await AuthLog.create({
      userId: user._id,
      action: 'token_refresh',
      success: true,
      ipAddress: req.ip,
      correlationId: req.correlationId
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    logger.error('Token refresh error', {
      error: error.message,
      correlationId: req.correlationId
    });

    clearAuthCookies(res);
    res.status(401).json({ error: 'Token refresh failed' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};
