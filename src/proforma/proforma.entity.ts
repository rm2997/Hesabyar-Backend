import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Proforma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  totalAmount: number;

  @Column({ nullable: true })
  approvedFile: string; // فایل امضا شده توسط مشتری

  @Column({ nullable: true })
  customerLink: string; //لینکی که برای مشتری ارسال می شود

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;
}
