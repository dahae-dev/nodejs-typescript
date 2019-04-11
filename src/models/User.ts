import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";

interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  provider: string;
  providerId: string;

  facebook: string;
  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };

  comparePassword: comparePasswordFunction;
  gravatar: (size: number) => string;
}

interface IUserModel extends IUser, mongoose.Document {
  _id: string;
}

export type UserModel = mongoose.Document & {
  _id?: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  provider: string;
  providerId: string;

  facebook: string;
  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };

  comparePassword: comparePasswordFunction;
  gravatar: (size: number) => string;
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

export type AuthToken = {
  accessToken: string;
  kind: string;
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String },
    password: String,
    name: String,
    phone: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    provider: String,
    providerId: String,

    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,

    profile: {
      name: String,
      gender: String,
      location: String,
      website: String,
      picture: String
    }
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

userSchema.methods.comparePassword = comparePassword;

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size: number) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto
    .createHash("md5")
    .update(this.email)
    .digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

// reference: https://stackoverflow.com/questions/37926481/mongoose-typescript-exporting-model-interface
export const User: mongoose.Model<IUserModel> = mongoose.model<IUserModel>("User", userSchema);
// export const User: UserType = mongoose.model<UserType>("User", userSchema);
// const User = mongoose.model("User", userSchema);
export default User;
