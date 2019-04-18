import { IMP_KEY, IMP_SECRET } from "../util/secrets";
const IMP_URL = "https://api.iamport.kr";
import axios from "axios";

export const getAccessToken = async () => {
  const getToken = await axios.post(`${IMP_URL}/users/getToken`, {
    IMP_KEY,
    IMP_SECRET
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
