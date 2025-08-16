import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { storage } from './storage';
import type { z } from 'zod';
import { insertOAuthUserSchema } from '@shared/schema';

type OAuthUser = z.infer<typeof insertOAuthUserSchema>;

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value);
      
      if (existingUser) {
        // Update user with OAuth info if needed
        return done(null, existingUser);
      }
      
      // Create new user
      const oauthUser: OAuthUser = {
        username: profile.displayName || profile.emails?.[0]?.value || `user_${profile.id}`,
        email: profile.emails?.[0]?.value || '',
        oauthProvider: 'google',
        oauthId: profile.id,
        isPremium: false
      };
      const newUser = await storage.createUser(oauthUser);
      
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configure Facebook OAuth
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value);
      
      if (existingUser) {
        return done(null, existingUser);
      }
      
      // Create new user
      const oauthUser: OAuthUser = {
        username: profile.displayName || profile.emails?.[0]?.value || `user_${profile.id}`,
        email: profile.emails?.[0]?.value || '',
        oauthProvider: 'facebook',
        oauthId: profile.id,
        isPremium: false
      };
      const newUser = await storage.createUser(oauthUser);
      
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configure Apple OAuth
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackURL: "/api/auth/apple/callback",
    scope: ['email', 'name']
  },
  async (accessToken, refreshToken, idToken, profile, done) => {
    try {
      // Apple ID tokens contain the email
      const email = profile.email;
      const name = profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : profile.sub;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        return done(null, existingUser);
      }
      
      // Create new user
      const oauthUser: OAuthUser = {
        username: name || email || `user_${profile.sub}`,
        email: email || '',
        oauthProvider: 'apple',
        oauthId: profile.sub,
        isPremium: false
      };
      const newUser = await storage.createUser(oauthUser);
      
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Passport session serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;