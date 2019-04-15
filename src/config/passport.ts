import passport from "passport";
import request from "request";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import _ from "underscore";

import { CLIENT_BASE_URL, FACEBOOK_ID, FACEBOOK_SECRET, FACEBOOK_CALLBACK_URL } from "../util/secrets";
import { sendResponseWithTokenInHeader } from "../util/token";

// import { User, UserType } from '../models/User';
import { default as User } from "../models/User.mongo";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
    // console.log("TCL: LocalStrategy");

    const user = User.findOne({ provider: "local", email: email.toLocaleLowerCase() });
    // console.log("TCL: LocalStrategy --> user", user);

    User.findOne({ provider: "local", email: email.toLowerCase() }, (err, user: any) => {
      if (err) {
        console.log("[-] LocalStrategy : DB Error occurred during finding user. ", err);
        return done(err);
      }

      // User not found.
      if (!user) {
        console.log("[-] LocalStrategy : no user found.");
        return done(undefined, false, { message: `Email ${email} not found.` });
      }

      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        // Error during comapring password.
        if (err) {
          console.log("[-] LocalStrategy : Error occurred during comparing user password.", err);
          return done(err);
        }

        // OK. Pasword matched.
        if (isMatch) {
          console.log("[+] LocalStrategy : password matched.");
          return done(undefined, user);
        }

        // NOK. Password not matched.
        console.log("[-] LocalStrategy : password is not matched.");
        return done(undefined, false, { message: "Invalid email or password." });
      });
    });
  })
);

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_ID,
      clientSecret: FACEBOOK_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["name", "email", "link", "locale", "timezone"],
      passReqToCallback: true
    },
    (req: any, accessToken, refreshToken, profile, done) => {
      // Session exists.
      if (req.user) {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            req.flash("errors", {
              msg:
                "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account."
            });
            // console.log("TCL: existingUser", existingUser);
            // done(err);
            // * : Changed to give JWT token for existingUser login.
            done(err, existingUser);
          } else {
            User.findById(req.user.id, (err, user: any) => {
              if (err) {
                return done(err);
              }
              user.provider = "facebook";
              user.providerId = profile.id;
              user.email = "";
              user.name = "";
              user.facebook = profile.id;
              user.tokens.push({ kind: "facebook", accessToken });
              user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
              user.profile.gender = user.profile.gender || profile._json.gender;
              user.profile.picture =
                user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.save((err: Error) => {
                req.flash("info", { msg: "Facebook account has been linked." });
                done(err, user);
              });
            });
          }
        });
        // No session user
      } else {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            // console.log("TCL: [*] existingUser", existingUser);
            return done(undefined, existingUser);
          }
          User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
            if (err) {
              return done(err);
            }
            if (existingEmailUser) {
              req.flash("errors", {
                msg:
                  "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings."
              });
              done(err);
            } else {
              const user: any = new User();
              user.provider = "facebook";
              user.providerId = profile.id;
              user.email = "";
              user.name = "";
              user.facebook = profile.id;
              user.tokens.push({ kind: "facebook", accessToken });
              user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
              user.profile.gender = profile._json.gender;
              user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.profile.location = profile._json.location ? profile._json.location.name : "";
              user.save((err: Error) => {
                // console.log("TCL: [+] Facebook first registration done.");
                done(err, user);
              });
            }
          });
        });
      }
    }
  )
);

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect(`${CLIENT_BASE_URL}/login`);
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
