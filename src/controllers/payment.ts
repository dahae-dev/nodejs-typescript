import { Request, Response } from "express";
import * as moment from "moment";
import axios from "axios";

import { default as Payment } from "../models/Payment.mongo";
import { getPaymentData } from "../util/iamport";
import addCommaSeparator from "../util/addCommaSeparator";
import { sendEmail } from "../util/emails";

const slackWebHookURL = "https://hooks.slack.com/services/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";

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
      buyer_name,
      buyer_email,
      buyer_tel,
      name,
      cancel_amount,
      pay_method,
      card_name,
      channel,
      merchant_uid,
      pg_tid,
      vbank_name,
      vbank_holder,
      vbank_num
    } = impPayment;
    let { paid_at, vbank_date } = impPayment; // 0
    paid_at = moment.unix(paid_at).format("YYYY-MM-DD HH:mm:ss");
    vbank_date = moment.unix(vbank_date).format("YYYY-MM-DD HH:mm:ss");
    console.log("***** paid_at: ", paid_at);
    console.log("***** vbank_date: ", vbank_date);

    const payment = await Payment.findOne({
      merchant_uid
    });
    console.log("***** payment.amount: ", payment.amount);
    const amountToBePaid = payment.amount;

    if (amount === amountToBePaid) {
      const updatedPayment = await Payment.update(
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
      console.log("***** updatedPayment: ", updatedPayment);

      const amountWithCommaSeparator = addCommaSeparator(amount);
      const paidBy = pay_method === "card" ? "카드" : "가상계좌";

      // const pathToTemplate = "apply";
      const recipient = buyer_email;
      const localVar = {
        name: buyer_name,
        course: name,
        amount: amountWithCommaSeparator,
        vbank_name,
        vbank_date,
        vbank_num
      };

      switch (status) {
        case "ready":
          let sendEmailResult = await sendEmail(status, recipient, localVar);
          console.log("***** sendEmailResult @ready: ", sendEmailResult); // undefined
          // TODO: must wrap below update sent_mail flag only if sendEmailResult is successfull
          let updateSentMailPayment = await updatedPayment.update({
            mail_sent: true
          });
          console.log("***** updatedSentMailPayment @ready", updateSentMailPayment);

          res.send({
            status,
            message: "가상계좌 발급 성공"
          });
          break;

        case "paid":
          sendEmailResult = await sendEmail(status, recipient, localVar);
          console.log("***** sendEmailResult @paid: ", sendEmailResult); // undefined
          // TODO: must wrap below update sent_mail flag only if sendEmailResult is successfull
          updateSentMailPayment = await updatedPayment.update({
            mail_sent: true
          });
          console.log("***** updatedSentMailPayment @paid", updateSentMailPayment);

          await axios.post(slackWebHookURL, {
            text: `\n스터디: ${name}\n이름: ${buyer_name}\n이메일: ${buyer_email}\n연락처: ${buyer_tel}\n결제금액: ${amountWithCommaSeparator} KRW\n결제수단: ${paidBy}\n결제번호: ${merchant_uid}\nimp_uid: ${imp_uid}`
          });

          res.send({
            status,
            message: "결제 완료"
          });
          break;

        default:
          if (status === "cancelled") {
            await axios.post(slackWebHookURL, {
              text: `결제 취소입니다\n스터디: ${name}\n이름: ${buyer_name}\n이메일: ${buyer_email}\n연락처: ${buyer_tel}\n취소금액: ${amountWithCommaSeparator} KRW\n결제번호: ${merchant_uid}\nimp_uid: ${imp_uid}`
            });
          }

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
