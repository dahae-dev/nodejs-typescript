import { Request, Response } from "express";
import { CLIENT_BASE_URL } from "../util/secrets";
/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  res.redirect(CLIENT_BASE_URL);
};
