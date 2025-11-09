const crypto = require('crypto');

exports.generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('base64url');
};

exports.generateCodeChallenge = (verifier) => {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
};

exports.generateState = () => {
  return crypto.randomBytes(16).toString('hex');
};

exports.generateNonce = () => {
  return crypto.randomBytes(16).toString('hex');
};
