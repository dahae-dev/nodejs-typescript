import * as jToken from "jsonwebtoken";

export interface IUser {
  _id: string;
  email: string;
  name: string;
}
export const generateToken = (user: any): string => {
  const claims = {
    _id: user._id,
    email: user.email
  };

  return jToken.sign(claims, process.env.JWT_SECRET);
};
