import nodemailer from "nodemailer";
import EmailTemplates, { ILocalVar } from "./email-templates";

const client = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASSWORD
  }
});
export const sendEmail = async (status: string, recipient: string, localVar: ILocalVar) => {
  const emailTemplates = new EmailTemplates();

  const email = {
    from: "communication@codestates.com",
    to: recipient,
    subject: emailTemplates[status](localVar).subject,
    html: emailTemplates[status](localVar).html
  };

  try {
    return await client.sendMail(email, (err, info) => {
      if (err) {
        console.log(err);
        return err;
      } else {
        console.log("Message sent: ", info);
        return {
          response: info.response,
          sentTo: info.accepted
        };
      }
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};
