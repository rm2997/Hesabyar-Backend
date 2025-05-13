import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Customer } from 'src/customer/customer.entity';
import { PaymentTypes } from 'src/common/decorators/payment.enum';

@Entity()
export class Proforma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bool')
  isAccepted: boolean;

  @ManyToOne(() => User, (user) => user.userAcceptedProforma, {
    nullable: true,
  })
  acceptedBy: User;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column('decimal')
  totalAmount: number;

  @Column({ type: 'enum', enum: PaymentTypes, default: PaymentTypes.Cash })
  paymentStatus: PaymentTypes;

  @Column({ nullable: true })
  chequeDate: Date;

  @Column('decimal', { nullable: true })
  chequeAmount: number;

  @Column({ nullable: true })
  chequeSerial: number;

  @Column({ nullable: true })
  paperMoneyDate: Date;

  @Column('decimal', { nullable: true })
  paperMoneyAmount: number;

  @Column({ nullable: true })
  paperMoneySerial: number;

  @Column({ nullable: true })
  trustIssueDate: Date;

  @Column({ nullable: true })
  approvedFile: string;

  @Column({ nullable: true })
  customerLink: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Good, (good) => good.goodProforma)
  proformaGoods: Good[];

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;
}
