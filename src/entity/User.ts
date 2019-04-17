import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, BeforeInsert } from "typeorm";
import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  passwordResetToken: string;

  @Column("datetime")
  passwordResetExpires: Date;

  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column({ default: false })
  isAdmin: boolean;

  @BeforeInsert()
  updatePasswordHash() {
    // TODO: In Async mode, password hash value is NOT updated. Why ?
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;

    // Async
    // bcrypt.genSalt(10, (err, salt) => {
    //   bcrypt.hash(this.password, salt, undefined, (err: any, hash) => {
    //     this.password = hash;
    //   });
    // });
  }
}
