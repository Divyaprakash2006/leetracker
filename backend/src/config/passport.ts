import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import AuthUser, { IAuthUser } from '../models/AuthUser';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AuthUser.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await AuthUser.findOne({
            provider: 'google',
            providerId: profile.id,
          });

          if (!user) {
            // Check if email already exists with different provider
            const existingUser = await AuthUser.findOne({
              email: profile.emails?.[0]?.value,
            });

            if (existingUser) {
              // Link the Google account to existing user
              existingUser.provider = 'google';
              existingUser.providerId = profile.id;
              existingUser.avatar = profile.photos?.[0]?.value;
              user = await existingUser.save();
            } else {
              // Create new user
              user = await AuthUser.create({
                email: profile.emails?.[0]?.value,
                name: profile.displayName,
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
              });
            }
          }

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists
          let user = await AuthUser.findOne({
            provider: 'github',
            providerId: profile.id,
          });

          if (!user) {
            // Get primary email from GitHub
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

            // Check if email already exists with different provider
            const existingUser = await AuthUser.findOne({ email });

            if (existingUser) {
              // Link the GitHub account to existing user
              existingUser.provider = 'github';
              existingUser.providerId = profile.id;
              existingUser.avatar = profile.photos?.[0]?.value;
              user = await existingUser.save();
            } else {
              // Create new user
              user = await AuthUser.create({
                email,
                name: profile.displayName || profile.username,
                provider: 'github',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
              });
            }
          }

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
