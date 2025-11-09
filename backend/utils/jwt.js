const jwt = require('jsonwebtoken');
const oauthConfig = require('../config/oauth.config');

exports.generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    oauthConfig.jwt.secret,
    { expiresIn: oauthConfig.jwt.expiresIn }
  );
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    oauthConfig.jwt.refreshSecret,
    { expiresIn: oauthConfig.jwt.refreshExpiresIn }
  );
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, oauthConfig.jwt.refreshSecret);
};

exports.setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...oauthConfig.cookie,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...oauthConfig.cookie,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.clearAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
