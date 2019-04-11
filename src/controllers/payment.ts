import { Request, Response } from "express";
import { default as Payment } from "../models/Payment";

export let test = (req: Request, res: Response) => {
  const payment: any = new Payment();
  payment.status = "good";
  payment.mail_sent = true;
  payment.amount = 0;
  payment.merchant_uid = "12345";
  payment.imp_uid = "12345";
  payment.card_name = "MasterCard";
  payment.buyer_name = "test";
  payment.save();

  console.log("TCL: payment", payment);
  res.json("Ok");
};

export const handlePayment = async (req: Request, res: Response) => {
  try {
    const { user_id, study_id, merchant_uid, pay_method, amount } = req.body;
    const paymentNotVerfied: any = new Payment({
      user_id,
      study_id,
      merchant_uid,
      status: "failed",
      mail_sent: false,
      amount,
      pay_method,
      imp_uid: ""
    });

    const result = await paymentNotVerfied.save();
    console.log("result: ", result);

    const success = result["$__"].inserting;

    res.json({
      success
    });
  } catch (err) {
    console.log(err);
    // TODO: proper error handling
    res.json({
      success: false,
      error: err.data.errors
    });
  }
};

export const handleNotification = async (req: Request, res: Response) => {
  try {
    const { merchant_uid } = req.body;
  } catch (err) {
    // TODO: proper error handling
    console.log(err);
    res.send(err);
  }
};
