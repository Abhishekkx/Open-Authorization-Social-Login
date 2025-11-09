const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const oauthConfig = require('./oauth.config');
const { logger } = require('../utils/logger');

// Mock strategy for local testing
class MockStrategy {
  constructor(name, verify) {
    this.name = name;
    this._verify = verify;
  }

  authenticate(req) {
    const mockProfile = {
      id: `mock-${this.name}-${Date.now()}`,
      displayName: `Mock ${this.name} User`,
      emails: [{ value: `mock-${this.name}@example.com` }],
      photos: [{ value: 'https://via.placeholder.com/150' }],
      provider: this.name
    };

    this._verify(req, null, null, mockProfile, (err, user) => {
      if (err) return this.error(err);
      if (!user) return this.fail();
      this.success(user);
    });
  }
}

// Google Strategy
if (process.env.MOCK_OAUTH === 'true') {
  passport.use('google', new MockStrategy('google', async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthProfile(profile, 'google', req);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
} else {
  passport.use(new GoogleStrategy({
    clientID: oauthConfig.google.clientID,
    clientSecret: oauthConfig.google.clientSecret,
    callbackURL: oauthConfig.google.callbackURL,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthProfile(profile, 'google', req);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Facebook Strategy
if (process.env.MOCK_OAUTH === 'true') {
  passport.use('facebook', new MockStrategy('facebook', async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthProfile(profile, 'facebook', req);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
} else {
  passport.use(new FacebookStrategy({
    clientID: oauthConfig.facebook.clientID,
    clientSecret: oauthConfig.facebook.clientSecret,
    callbackURL: oauthConfig.facebook.callbackURL,
    profileFields: oauthConfig.facebook.profileFields,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthProfile(profile, 'facebook', req);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Handle OAuth profile (create or link user)
async function handleOAuthProfile(profile, provider, req) {
  const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
  const providerId = profile.id;
  const providerKey = `${provider}Id`;

  logger.info('OAuth profile received', {
    provider,
    providerId,
    email,
    correlationId: req.correlationId
  });

  // Check if user is already logged in (account linking)
  if (req.user) {
    // Link provider to existing account
    const user = await User.findById(req.user._id);
    
    if (user[providerKey]) {
      throw new Error(`${provider} account already linked`);
    }

    user[providerKey] = providerId;
    user.providers.push(provider);
    await user.save();

    logger.info('Provider linked to existing account', {
      userId: user._id,
      provider,
      correlationId: req.correlationId
    });

    return user;
  }

  // Check if user exists with this provider ID
  let user = await User.findOne({ [providerKey]: providerId });

  if (user) {
    // Returning user
    logger.info('Returning user login', {
      userId: user._id,
      provider,
      correlationId: req.correlationId
    });
    return user;
  }

  // Check if user exists with this email
  if (email) {
    user = await User.findOne({ email });
    
    if (user) {
      // Link provider to existing email account
      user[providerKey] = providerId;
      if (!user.providers.includes(provider)) {
        user.providers.push(provider);
      }
      await user.save();

      logger.info('Provider linked to existing email account', {
        userId: user._id,
        provider,
        correlationId: req.correlationId
      });

      return user;
    }
  }

  // Create new user
  user = await User.create({
    email,
    [providerKey]: providerId,
    providers: [provider],
    name: profile.displayName || 'User',
    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
    role: 'user'
  });

  logger.info('New user created', {
    userId: user._id,
    provider,
    correlationId: req.correlationId
  });

  return user;
}

module.exports = passport;
