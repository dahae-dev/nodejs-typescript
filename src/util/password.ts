import bcrypt from "bcrypt-nodejs";

type comparePasswordFunction = (user: any, password: string, cb: (err: any, isMatch: any) => void) => void;

const comparePassword: comparePasswordFunction = function(user, password, cb) {
  bcrypt.compare(password, user.password, (err: any, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

export default comparePassword;
