'use strict';
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('./env');
const authService = require('../services/authService');

passport.use(new GoogleStrategy({
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.callbackUrl,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      
      const result = await authService.googleLogin(email, googleId);
      return done(null, result);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;
