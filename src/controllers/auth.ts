import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { WriteError } from "mongodb";

import * as token from "../util/token";
import { CLIENT_BASE_URL, DATABASE_TYPE } from "../util/secrets";
import { default as UserMongo, UserModel, AuthToken } from "../models/User";
import { User } from "../entity/User";
export let getAdditionalInfo = (req: Request, res: Response) => {
  const { user } = req;
  let userId;
  if (DATABASE_TYPE === "TYPEORM") {
    const { id } = req.user;
    userId = id;
  } else {
    const { _id: id } = req.user;
    userId = id;
  }

  // No personal info when social locain used.
  if (!user.email || !user.phone) {
    res.redirect(`${CLIENT_BASE_URL}/submitAdditionalInfo?start="auth"&id=${userId}&end="end"`);
    // We got personal info. Just re-direct to give token.
  } else {
    res.redirect("/auth/token");
  }
};

export let postAdditionalInfo = async (req: Request, res: Response) => {
  const { id, name, email, phone } = req.body;

  // TypeORM
  if (DATABASE_TYPE === "TYPEORM") {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ id });

    user.name = name;
    user.email = email;
    user.phone = phone;

    await userRepository.save(user);
    token.sendResponseWithTokenInHeader(res, user);
  } else {
    UserMongo.findById(id, (err, user: UserModel) => {
      // if (err) error handling
      user.name = name;
      user.email = email;
      user.phone = phone;

      user.save((err: WriteError) => {
        // if (err) error hadling
        // req.flash("success", { msg: "Profile information has been updated." });

        token.sendResponseWithTokenInHeader(res, user);
      });
    });
  }
};

// INFO: When client can't take the respons like using a href link, make client redirect to /temp via authController.
export let getToken = (req: Request, res: Response) => {
  const myToken = token.generateToken(req.user);

  res.redirect(`${CLIENT_BASE_URL}/temp?start="auth"&token=${myToken}&userId=${req.user.id}&end="end"`);
};
