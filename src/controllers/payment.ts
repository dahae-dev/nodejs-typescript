import { Request, Response } from "express";
import { default as Payment } from "../models/Payment";
import { getPaymentData, getPaymentDataByMerchantUid } from "../util/iamport";
import * as moment from "moment";
import addCommaSeparator from "../util/addCommaSeparator";
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
      status: "unpaid",
      mail_sent: false,
      amount,
      pay_method,
      imp_uid: ""
    });

    const result = await paymentNotVerfied.save();
    // console.log("result: ", result);

    const success = result["$__"].inserting;

    res.json({
      success,
      merchant_uid
    });
  } catch (err) {
    console.log("***** err ****** : ", err);
    // TODO: proper error handling
    res.json({
      success: false,
      error: err
    });
  }
};

export const handleNotification = async (req: Request, res: Response) => {
  try {
    console.log("***** req.body: ", req.body);
    const { imp_uid } = req.body;

    console.log("***** imp_uid: ", imp_uid);

    const impPayment = await getPaymentData(imp_uid);
    console.log("***** impPayment: ", impPayment);
    const {
      amount,
      status,
      cancel_amount,
      pay_method,
      card_name,
      channel,
      merchant_uid,
      pg_tid,
      vbank_name,
      vbank_date,
      vbank_holder,
      vbank_num
    } = impPayment;
    let { paid_at } = impPayment; // 0
    paid_at = moment.unix(paid_at).format("YYYY-MM-DD HH:mm:ss");
    console.log("***** paid_at: ", paid_at);

    const payment = await Payment.findOne({
      merchant_uid
    });
    console.log("***** payment.amount: ", payment.amount);
    const amountToBePaid = payment.amount;

    if (amount === amountToBePaid) {
      const updateResult = await Payment.update(
        { merchant_uid },
        {
          amount,
          status,
          cancel_amount,
          pay_method,
          paid_at,
          imp_uid,
          card_name,
          pg_tid,
          vbank_name,
          vbank_date,
          vbank_holder,
          vbank_num,
          channel
        }
      );
      console.log("***** updateResult: ", updateResult);

      const amountWithCommaSeparator = addCommaSeparator(amount);
      // console.log("***** amount w/ comma: ", amountWithCommaSeparator);

      switch (status) {
        case "ready":
          // TODO: 가상계좌 발급 안내메일 or 문자 발송
          res.send({
            status,
            message: "가상계좌 발급 성공"
          });
          break;

        case "paid":
          // TODO: 결제 완료 안내메일 or 문자 발송
          res.send({
            status,
            message: "결제 완료"
          });
          break;

        default:
          res.send({
            status,
            message: "미결제"
          });
          break;
      }
    } else {
      // 결제 금액 불일치. 위/변조 된 결제
      throw { status: "forgery", message: "위조된 결제 시도" };
    }
  } catch (err) {
    // TODO: proper error handling
    console.log(err);
    res.send(err);
  }
};
