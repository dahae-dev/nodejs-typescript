import { Request, Response } from "express";
import { getRepository, createQueryBuilder } from "typeorm";
import jwtDecode from "jwt-decode";

import { User } from "../entity/User";
import { Payment } from "../entity/Payment";

export const test = async (req: Request, res: Response) => {
  const id = req.body.id;
  const payment = await getRepository(Payment).find({ relations: ["user"] });
  res.send(payment);
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const token = req.headers["x-auth-token"] as string;
    const decoded = jwtDecode(token) as { id: number };
    const id = decoded.id;
    // console.log("id: ", id);

    const paymentQb = await getRepository(Payment).createQueryBuilder("payment");

    const result = await paymentQb
      .select("payment.study_id")
      .where("payment.userId = :userId", { userId: id })
      .andWhere("payment.status = :status", { status: "paid" })
      .orderBy("payment.paid_at", "ASC")
      .getMany();
    // console.log("result: ", result);

    const courses = !!result.length ? result : [];

    res.send({
      courses
    });
  } catch (err) {
    console.log(err);
    res.send({ error: err.message });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const study_id = req.query.study_id;

    const token = req.headers["x-auth-token"] as string;
    const decoded = jwtDecode(token) as { id: number };
    const id = decoded.id;

    const userQb = await getRepository(User).createQueryBuilder("user");
    const members = await userQb
      .innerJoin("user.payment", "payment")
      .select(["user.id", "user.name", "user.email", "user.phone"])
      .where("payment.status = :status", { status: "paid" })
      .andWhere("payment.study_id = :study_id", { study_id })
      .andWhere("user.id != :id", { id })
      .getMany();

    res.json({
      members
    });
  } catch (err) {
    console.log(err);
    res.send({ error: err.message });
  }
};
