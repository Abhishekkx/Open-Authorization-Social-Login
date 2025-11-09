const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

exports.validateState = (req, res, next) => {
  const state = req.query.state;
  const storedState = req.cookies.oauth_state;

  if (!state || !storedState || state !== storedState) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  // Clear state cookie
  res.clearCookie('oauth_state');
  next();
};
