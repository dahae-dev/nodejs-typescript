// import { IMP_KEY, IMP_SECRET } from "../util/secrets";
const imp_key = "0794151887787607";
const imp_secret = "sOaZXYF3GFtPfAJ6nvW9a0S1mRkyx0PZO0ZMZFQFkjvAUeGhKCqUDjVZagyIhoI6oHTnnJ3I2yiWNZex";
const IMP_URL = "https://api.iamport.kr";
import axios from "axios";

export const getAccessToken = async () => {
  // console.log("IMP_KEY: ", IMP_KEY);
  // console.log("IMP_SECRET: ", IMP_SECRET);
  const getToken = await axios.post(`${IMP_URL}/users/getToken`, {
    imp_key,
    imp_secret
  });
  const accessToken = getToken.data.response.access_token;
  return {
    Authorization: accessToken
  };
};

export const getPaymentData = async (imp_uid: string) => {
  const header = await module.exports.getAccessToken();
  const paymentFromIamport = await axios.get(`${IMP_URL}/payments/${imp_uid}`, {
    headers: header
  });
  return paymentFromIamport.data.response;
};

export const getPaymentDataByMerchantUid = async (merchant_uid: string) => {
  const header = await module.exports.getAccessToken();
  const paymentFromIamport = await axios.get(`${IMP_URL}/payments/find/${merchant_uid}`, {
    headers: header
  });
  return paymentFromIamport.data.response;
};
