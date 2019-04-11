import mongoose from "mongoose";

interface IPayment {
  user_id: string;
  study_id: string;
  status: string;
  merchant_uid: string;
  mail_sent: boolean;
  amount: number;
  cancel_amount?: number;
  pay_method: string;
  paid_at?: Date;
  imp_uid: string;
  pg_tid?: string;
  card_name?: string;
  last_4digit?: string;
  // buyer_name: string;
  // buyer_tel: string;
  vbank_name?: string;
  vbank_date?: Date;
  vbank_num?: string;
  channel?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IPaymentModel extends IPayment, mongoose.Document {}

export type PaymentModel = mongoose.Document & {
  user_id: string;
  study_id: string;
  status: string;
  merchant_uid: string;
  mail_sent: boolean;
  amount: number;
  cancel_amount?: number;
  pay_method: string;
  paid_at?: Date; // TODO: middleware 추가 -> onUpdate
  imp_uid: string;
  pg_tid?: string;
  card_name?: string;
  last_4digit?: string;
  // buyer_name: string;
  // buyer_tel: string;
  vbank_name?: string;
  vbank_date?: Date;
  vbank_num?: string;
  channel?: string;
  createdAt: Date;
  updatedAt: Date; // TODO: middleware 추가 -> onUpdate
};

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  study_id: {
    type: String,
    required: true
  },
  merchant_uid: {
    type: String,
    required: true
  },
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
  cancel_amount: {
    type: Number,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  pay_method: {
    type: String,
    required: true
  },
  paid_at: {
    type: Date,
    default: Date.now
  },
  imp_uid: {
    type: String,
    required: function() {
      return this.status !== "unpaid";
    }
  },
  pg_tid: {
    type: String,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  card_name: {
    type: String,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  last_4digit: {
    type: String,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  vbank_name: {
    type: String,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  vbank_date: {
    type: Date,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  vbank_num: {
    type: String,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  // buyer_name: {
  //   type: String,
  //   required: true
  // },
  // buyer_tel: {
  //   type: String,
  //   required: true
  // },
  channel: {
    type: String,
    // tslint:disable-next-line: no-null-keyword
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Payment: mongoose.Model<IPaymentModel> = mongoose.model<IPaymentModel>("Payment", paymentSchema);
// const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
