import { Request, Response } from "express";

export const check = (req: Request, res: Response) => {
  const queryCode = req.query.coupon;

  switch (queryCode) {
    case "csalum2015":
      return res.json({
        couponValidity: true,
        discount: 0.5
      });
    default:
      return res.json({
        couponValidity: false,
        discount: 0
      });
  }
};
