import express from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import logger from "./util/logger";
import morgan from "morgan";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import "reflect-metadata";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Photo } from "./entity/Photo";

import * as token from "./util/token";
import { CLIENT_BASE_URL, MONGODB_URI, SESSION_SECRET } from "./util/secrets";

createConnection()
  .then(connection => {
    console.log(`[+] TypeORM connection done.`);
  })
  .catch(error => console.log(`[-] TypeORM Error : ${error}`));
// MongoDB
const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
// dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";
import * as authController from "./controllers/auth";
import * as couponController from "./controllers/coupon";
import * as paymentController from "./controllers/payment";

import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose
  .connect(mongoUrl, { useMongoClient: true })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
  });

// Express configuration
app.set("port", process.env.PORT || 5000);

// TODO: exclude pug view
// app.set("views", path.join(__dirname, "../views"));
// app.set("view engine", "pug");
// ------

// For Social login
app.use(cors());
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "appid, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
//   next();
// });

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      url: mongoUrl,
      autoReconnect: true
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// TODO: Change to refer NODE_ENV
app.use(morgan("dev"));

app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)
  ) {
    req.session.returnTo = req.path;
  } else if (req.user && req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

// app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);

app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);

app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);

app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  // console.log("TCL: [*] /auth/facebook/callback : req.user = ", req.user);

  res.redirect("/auth/additionalInfo");
});

app.get("/auth/additionalInfo", authController.getAdditionalInfo);
app.post("/auth/additionalInfo", authController.postAdditionalInfo);

app.get("/auth/token", authController.getToken);

/**
 * coupon
 */
app.get("/coupon", couponController.check);

/**
 * payment
 */
app.get("/payment", paymentController.test);
app.post("/payment", paymentController.handlePayment);
app.post("/payment/notification", paymentController.handleNotification);

export default app;
