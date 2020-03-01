import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import GoogleOauthTokenStrategy from 'passport-google-oauth-token'
import FacebookTokenStrategy from 'passport-facebook-token';

import { addOrLoginUser, loginWithPassword } from "../services/User";
import { User } from "../models/User";

const { HOST,
  FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, 
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy({
    usernameField : "email", passwordField: "password"
  },
  async function(username, password, done) {
    try {
      const user: User = await loginWithPassword(username, password);
      return done(null, user);
    }
    catch (err) {
      return done(err);
    }
  }
));

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
  }, 
  async function(accessToken, refreshToken, profile, done) {
    const user = new User();
    user.username = profile.displayName;
    user.email = profile.emails[0].value;
    user.facebookId = profile.id;
    user.role = "USER";

    try {
      await addOrLoginUser(user);
      return done(null, user);
    }
    catch (err) {
      return done(err)
    }
  }
));

passport.use(new GoogleOauthTokenStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  },
  async function(accessToken, refreshToken, profile, done) {
    const user = new User();
    user.username = profile.displayName;
    user.email = profile.emails[0].value;
    user.googleId = profile.id;
    user.role = "USER";

    try {
      await addOrLoginUser(user);
      return done(null, user);
    }
    catch (err) {
      return done(err)
    }
  }
));