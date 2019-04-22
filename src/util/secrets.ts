import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

const env = process.env.NODE_ENV || "local";

// development
if (env === "development") {
  if (fs.existsSync(".env.development")) {
    logger.debug("[+] Using .env.development file to supply config environment variables");
    dotenv.config({ path: ".env.development" });
  }
  // local
} else {
  if (fs.existsSync(".env.local")) {
    logger.debug("[+] Using env.local file to supply config environment variables");
    dotenv.config({ path: ".env.local" });
  }
  //   logger.debug("[+] Using .env file to supply config environment variables");
  //   dotenv.config({ path: ".env" }); // you can delete this after you create your own .env file!
}

export const CLIENT_BASE_URL = process.env["CLIENT_BASE_URL"];

// SESSION_SECRET
export const SESSION_SECRET = process.env["SESSION_SECRET"];

if (!SESSION_SECRET) {
  logger.error("No client secret. Set SESSION_SECRET environment variable.");
  process.exit(1);
}

// JWT_SECRET
export const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET) {
  logger.error("No client secret. Set JWT_SECRET environment variable.");
  process.exit(1);
}

// MONGODB_URI
export const MONGODB_URI = process.env["MONGODB_URI"];

if (!MONGODB_URI) {
  logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
  process.exit(1);
}

export const FACEBOOK_ID = process.env["FACEBOOK_ID"];
export const FACEBOOK_SECRET = process.env["FACEBOOK_SECRET"];
export const FACEBOOK_CALLBACK_URL = process.env["FACEBOOK_CALLBACK_URL"];

if (!FACEBOOK_ID || !FACEBOOK_SECRET || !FACEBOOK_CALLBACK_URL) {
  logger.error(
    "No Facebook Client ID/Secret string. Set FACEBOOK_ID/FACEBOOK_SECRET/FACEBOOK_CALLBACK_URL environment variable."
  );
  process.exit(1);
}

export const KAKAO_ID = process.env["KAKAO_ID"];
if (!KAKAO_ID) {
  logger.error("No KAKAO Client ID string. Set KAKAO_ID environment variable.");
  process.exit(1);
}

export const SENDGRID_USER = process.env["SENDGRID_USER"];
export const SENDGRID_PASSWORD = process.env["SENDGRID_PASSWORD"];

if (!SENDGRID_USER || !SENDGRID_PASSWORD) {
  logger.error("No mongo connection string. Set SENDGRID_USER or SENDGRID_PASSWORD environment variable.");
  process.exit(1);
}

export const DATABASE_TYPE = process.env.DATABASE_TYPE;
if (!DATABASE_TYPE) {
  logger.error("No DATABASE configuration. Set DATABASE_TYPE environment variable.");
  process.exit(1);
}

export const IMP_KEY = process.env.IMP_KEY;
export const IMP_SECRET = process.env.IMP_SECRET;
if (!IMP_KEY || !IMP_SECRET) {
  logger.error("No IAMPORT ID/SECRET string. Set IMP_KEY or IMP_SECRET environment variable.");
  process.exit(1);
}
