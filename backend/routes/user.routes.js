const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Profile routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, apiLimiter, userController.updateProfile);

// Provider linking
router.post('/link/:provider', authenticate, userController.linkProvider);
router.delete('/unlink/:provider', authenticate, userController.unlinkProvider);

// Auth logs
router.get('/auth-logs', authenticate, userController.getAuthLogs);

module.exports = router;
