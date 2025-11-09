const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Google OAuth
router.get('/google', authLimiter, authController.initiateOAuth('google'));
router.get('/google/callback', authController.oauthCallback('google'));

// Facebook OAuth
router.get('/facebook', authLimiter, authController.initiateOAuth('facebook'));
router.get('/facebook/callback', authController.oauthCallback('facebook'));

// Token management
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

// Current user
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
