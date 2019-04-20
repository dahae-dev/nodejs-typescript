import { Request, Response } from "express";
import { getRepository } from "typeorm";
import jwtDecode from "jwt-decode";

import { User } from "../entity/User";
import { Payment } from "../entity/Payment";

export const test = async (req: Request, res: Response) => {
  const id = req.body.id;
  const payment = await getRepository(Payment).find({ relations: ["user"] });
  res.send(payment);
};

export const getCourses = async (req: Request, res: Response) => {
  const token = req.headers["x-auth-token"] as string;
  const decoded = jwtDecode(token) as { id: number };
  const id = decoded.id;
  console.log("id: ", id);
  const user = await getRepository(User).findOne({ id });

  const paymentQb = await getRepository(Payment).createQueryBuilder("payment");

  const result = await paymentQb
    .select("payment.study_id")
    .where("payment.userId = :userId", { userId: id }) // TODO: userId 가능한지 다시 확인! user 넣을 경우 syntax 에러
    .andWhere("payment.status = :status", { status: "paid" })
    .orderBy("payment.paid_at", "ASC")
    .getMany();
  console.log("result: ", result);

  const courses = !!result.length ? result : [];

  res.send({
    courses
  });
};
