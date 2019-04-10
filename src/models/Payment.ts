import mongoose from "mongoose";

export type PaymentModel = mongoose.Document & {
  status: string;
  mail_sent: boolean;
  amount: number;
  cancel_amount?: number;
  pay_method?: string;
  paid_at?: Date;
  merchant_uid: string;
  imp_uid: string;
  card_name?: string;
  last_4digit?: string;
  buyer_name: string;
  buyer_tel?: string;
  channel?: string;
  airpot?: string;
  address?: string;
};

const paymentSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  mail_sent: {
    type: Boolean,
    required: true,
    default: false
  },
  amount: {
    type: Number,
    required: true
  },
  cancel_amount: Number,
  pay_method: String,
  paid_at: Date,
  merchant_uid: {
    type: String,
    required: true
  },
  imp_uid: {
    type: String,
    required: true
  },
  card_name: {
    type: String,
    default: ""
  },
  last_4digit: {
    type: String
  },
  buyer_name: {
    type: String,
    required: true
  },
  buyer_tel: String,
  channel: String,
  airpot: String,
  address: String
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
