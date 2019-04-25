import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import * as jToken from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import _ from "underscore";
import { getRepository } from "typeorm";

import { CLIENT_BASE_URL, DATABASE_TYPE } from "../util/secrets";
import { default as UserMongo, UserModel, AuthToken } from "../models/User";
import { User } from "../entity/User";
import * as token from "../util/token";
import "../config/passport";
import { connection } from "../app";
import calculateAndSavePasswordHash from "../util/password";

const request = require("express-validator");

/**
 * GET /signup
 * Signup page.
 */
export let getSignup = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/signup", {
    title: "Create Account"
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
export let postSignup = async (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();
  if (errors) {
    // console.log("TCL: postSignup -> errors", errors);
    req.flash("errors", errors);
    // return res.redirect("/signup");
    return res.status(400).send("Password가 일치하지 않습니다.");
  }

  // console.log("TCL: postSignup -> user", req.body);
  const { name, email, password, phone } = req.body;

  // * TypeORM
  if (DATABASE_TYPE === "TYPEORM") {
    const userRepository = getRepository(User);
    const existingUser = await userRepository.findOne({
      provider: "local",
      email
    });

    // Found existing user
    if (existingUser) {
      req.flash("errors", { msg: "Account with that email address already exists." });
      return res.redirect(`${CLIENT_BASE_URL}/login`);
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    user.phone = phone;
    user.provider = "local";
    user.providerId = "";

    await userRepository.save(user);

    req.logIn(user, err => {
      if (err) return next(err);

      req.logIn(user, err => {
        if (err) {
          return next(err);
        }
        const myToken = token.generateToken(user);
        res
          .header("x-auth-token", myToken)
          .header("access-control-expose-headers", "x-auth-token")
          .send(_.pick(user, "_id", "name", "email"));
      });
    });

    // * MongoDB
  } else {
    const userMongo = new UserMongo({
      name,
      email,
      password,
      phone,
      provider: "local",
      providerId: ""
    });

    // User.findOne({ email: req.body.email }, (err, existingUser) => {
    UserMongo.findOne({ provider: "local", email }, (err, existingUser) => {
      // Error
      if (err) return next(err);

      // Found existing user
      if (existingUser) {
        req.flash("errors", { msg: "Account with that email address already exists." });
        return res.redirect(`${CLIENT_BASE_URL}/login`);
      }
      // New User
      userMongo.save((err: WriteError) => {
        if (err) return next(err);

        req.logIn(userMongo, err => {
          if (err) {
            return next(err);
          }

          const myToken = token.generateToken(userMongo);
          res
            .header("x-auth-token", myToken)
            .header("access-control-expose-headers", "x-auth-token")
            .send(_.pick(userMongo, "_id", "name", "email"));
        });
      });
    });
  }
};

/**
 * GET /login
 * Login page.
 */
export let getLogin = (req: Request, res: Response) => {
  if (req.user) return res.redirect(`${CLIENT_BASE_URL}`);
  else return res.redirect(`${CLIENT_BASE_URL}/login`);
};

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  // console.log("TCL: postLogin entered.");

  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password cannot be blank").notEmpty();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    // console.log("TCL: postLogin -> errors", errors);
    req.flash("errors", errors);
    // return res.redirect("/login");
    return res.status(400).send(`Login failed.`);
  }

  passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
    // Error
    if (err) {
      console.log(err);
      return res.status(400).send(`Login failed : ${err}`);
    }

    // No user with that email
    if (!user) {
      req.flash("errors", info.message);
      // TODO: Why ?
      return res.status(400).send("No email required or Wrong id/password.");
      // return res.redirect("/signup");
    }
    // User login
    req.logIn(user, err => {
      // console.log("TCL: postLogin -> user", user);

      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });

      const myToken = token.generateToken(user);
      res
        .header("x-auth-token", myToken)
        .header("access-control-expose-headers", "x-auth-token")
        .send(_.pick(user, "_id", "name", "email"));
      // res.redirect(req.session.returnTo || "/");
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout();
  res.redirect(`${CLIENT_BASE_URL}`);
};

/**
 * GET /account
 * Profile page.
 */
export let getAccount = (req: Request, res: Response) => {
  res.render("account/profile", {
    title: "Account Management"
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export let postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Please enter a valid email address.").isEmail();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/account");
  }

  UserMongo.findById(req.user.id, (err, user: any) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user.save((err: WriteError) => {
      if (err) {
        if (err.code === 11000) {
          req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
          return res.redirect("/account");
        }
        return next(err);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/account");
  }

  UserMongo.findById(req.user.id, (err, user: UserModel) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err: WriteError) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Password has been changed." });
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export let postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  UserMongo.remove({ _id: req.user.id }, err => {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect(`${CLIENT_BASE_URL}`);
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export let getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.params.provider;
  UserMongo.findById(req.user.id, (err, user: any) => {
    if (err) {
      return next(err);
    }
    user[provider] = undefined;
    user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
    user.save((err: WriteError) => {
      if (err) {
        return next(err);
      }
      req.flash("info", { msg: `${provider} account has been unlinked.` });
      res.redirect("/account");
    });
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
// export let getForgot = (req: Request, res: Response) => {
//   if (req.isAuthenticated()) {
//     return res.redirect("/");
//   }
//   res.render("account/forgot", {
//     title: "Forgot Password"
//   });
// };

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export let postForgot = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Please enter a valid email address.").isEmail();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect(`${CLIENT_BASE_URL}/forgot`);
  }

  const { email } = req.body;

  async.waterfall(
    [
      function createRandomToken(done: Function) {
        crypto.randomBytes(16, (err, buf) => {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      async function setRandomToken(token: string, done: Function) {
        if (DATABASE_TYPE === "TYPEORM") {
          try {
            const userRepository = getRepository(User);
            const user = await userRepository.findOne({ email, provider: "local" });

            if (!user) {
              req.flash("errors", { msg: "Account with that email address does not exist." });
              return res.redirect("/forgot");
            }
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 3600000; // 1 hour

            await userRepository.save(user);
            done(undefined, token, user);
          } catch (err) {
            done(err);
          }
        } else {
          UserMongo.findOne({ email: req.body.email }, (err, user: any) => {
            if (err) {
              return done(err);
            }
            if (!user) {
              req.flash("errors", { msg: "Account with that email address does not exist." });
              return res.redirect("/forgot");
            }
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 3600000; // 1 hour
            user.save((err: WriteError) => {
              done(err, token, user);
            });
          });
        }
      },
      function sendForgotPasswordEmail(token: string, user: UserModel, done: Function) {
        const transporter = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD
          }
        });
        const mailOptions = {
          to: user.email,
          from: "noreply@studystates.net",
          subject: "Reset your password on Studystates.net",
          text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${CLIENT_BASE_URL}/reset?start=auth&token=${token}&end=end\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        // http://${req.headers.host}/reset?token=${token}\n\n
        transporter.sendMail(mailOptions, err => {
          req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
          done(err);
        });
      }
    ],
    err => {
      if (err) {
        return next(err);
      }
      // res.redirect("/forgot");
      res.send("Ok");
    }
  );
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export let getReset = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (DATABASE_TYPE === "TYPEORM") {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
      passwordResetToken: req.params.token
    });

    if (!user) {
      req.flash("errors", { msg: "Password reset token is invalid or has expired." });
      return res.redirect(`${CLIENT_BASE_URL}/forgot`);
    }

    if (user.passwordResetExpires > Date.now()) {
      return res.status(400).send("Password reset token 유효기간이 만료되었습니다.");
    }
    // Normal case : redirect to reset password in client.
    return res.redirect(`${CLIENT_BASE_URL}/reset/${req.params.token}`);
  } else {
    UserMongo.findOne({ passwordResetToken: req.params.token })
      .where("passwordResetExpires")
      .gt(Date.now())
      .exec((err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          req.flash("errors", { msg: "Password reset token is invalid or has expired." });
          return res.redirect("/forgot");
        }
        res.render("account/reset", {
          title: "Password Reset"
        });
      });
  }
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export let postReset = (req: Request, res: Response, next: NextFunction) => {
  req.assert("token", "Token must not be empty").notEmpty();
  req.assert("password", "Password must be at least 4 characters long.").len({ min: 4 });
  req.assert("confirm", "Passwords must match.").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("back");
  }
  const { token, password, confirm } = req.body;

  async.waterfall(
    [
      async function resetPassword(done: Function) {
        if (DATABASE_TYPE === "TYPEORM") {
          const userRepository = getRepository(User);
          const user = await userRepository.findOne({
            passwordResetToken: token
          });

          if (!user) {
            return res.status(400).send("Password reset token is invalid or has expired.");
          }

          if (user.passwordResetExpires > Date.now()) {
            return res.status(400).send("Password reset token 유효기간이 만료되었습니다.");
          }

          // Normal : Change password
          user.password = password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;

          try {
            await userRepository.save(user);
            req.logIn(user, err => {
              done(err, user);
            });
          } catch (err) {
            return next(err);
          }
        } else {
          UserMongo.findOne({ passwordResetToken: req.params.token })
            .where("passwordResetExpires")
            .gt(Date.now())
            .exec((err, user: any) => {
              if (err) {
                return next(err);
              }
              if (!user) {
                req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                return res.redirect("back");
              }
              user.password = req.body.password;
              user.passwordResetToken = undefined;
              user.passwordResetExpires = undefined;

              user.save((err: WriteError) => {
                if (err) {
                  return next(err);
                }
                req.logIn(user, err => {
                  done(err, user);
                });
              });
            });
        }
      },
      function sendResetPasswordEmail(user: UserModel, done: Function) {
        const transporter = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD
          }
        });
        const mailOptions = {
          to: user.email,
          from: "noreply@studystates.net",
          subject: "Your password has been changed",
          text: `Hello,\n\nThis is a confirmation that the password for your account ${
            user.email
          } has just been changed.\n`
        };
        transporter.sendMail(mailOptions, err => {
          req.flash("success", { msg: "Success! Your password has been changed." });
          done(err);
        });
      }
    ],
    err => {
      if (err) {
        return next(err);
      }
      res.send("Ok");
    }
  );
};
