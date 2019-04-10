import { Request, Response } from "express";
import { default as Payment } from "../models/Payment";

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  // res.redirect(CLIENT_BASE_URL);
  const payment: any = new Payment();
  payment.status = "good";
  payment.mail_send = true;
  payment.amount = 0;
  payment.merchant_uid = "12345";
  payment.imp_uid = "12345";
  payment.card_name = "MasterCard";
  payment.buyer_name = "test";
  payment.save();

  console.log("TCL: payment", payment);
  res.json("Ok");
};
