import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, BeforeInsert, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../entity/User";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User)
  @JoinColumn()
  userId: User;

  @Column()
  study_id: string;

  @Column()
  merchant_uid: string;

  @Column()
  status: string;

  @Column()
  mail_sent: boolean;

  @Column()
  amount: number;

  @Column({ nullable: true })
  cancel_amount: number;

  @Column()
  pay_method: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  paid_at: Date;

  @Column()
  imp_uid: string;

  @Column({ nullable: true })
  pg_tid: string;

  @Column({ nullable: true })
  card_name: string;

  @Column({ nullable: true })
  last_4digit: string;

  @Column({ nullable: true })
  vbank_name: string;

  @Column({ nullable: true })
  vbank_date: Date;

  @Column({ nullable: true })
  vbank_num: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
