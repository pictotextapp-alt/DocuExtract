import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { premiumService } from './premium-service';

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Get the correct callback URL based on environment
  const replotDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
  const callbackURL = replotDomain 
    ? `https://${replotDomain}/api/auth/google/callback`
    : "http://localhost:5000/api/auth/google/callback";

  console.log('OAuth callback URL:', callbackURL);

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists by email
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by Google'), null);
      }
      
      // Check if email is in premium users list first
      const isPremium = await premiumService.isPremiumUser(email);
      if (!isPremium) {
        return done(new Error('Only premium subscribers can log in. Please purchase premium first.'), null);
      }
      
      const existingUser = await premiumService.getUserByEmail(email);
      
      if (existingUser) {
        // User exists, log them in
        return done(null, existingUser);
      }
      
      // Create new user with OAuth data (they're already premium verified)
      const newUser = await premiumService.createUser({
        username: profile.displayName || email.split('@')[0] || `user_${profile.id}`,
        email: email,
        oauthProvider: 'google',
        oauthId: profile.id
      });
      
      return done(null, newUser);
    } catch (error) {
      console.error('Google OAuth error:', error);
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