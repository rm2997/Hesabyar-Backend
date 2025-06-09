import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Customer } from 'src/customer/customer.entity';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { ProformaGoods } from './proforma-goods.entity';

@Entity()
export class Proforma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'bool', nullable: true, default: false })
  isConverted: boolean;

  @ManyToOne(() => User, (user) => user.userConvertedProforma, {
    nullable: true,
  })
  convertedBy: User;

  @Column({ type: 'bool', nullable: true, default: false })
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

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'nvarchar', nullable: true })
  sepidarId: string;

  @Column({ type: Boolean, default: false })
  isSent: boolean;

  @OneToMany(() => ProformaGoods, (item) => item.proforma, {
    cascade: true, // برای auto insert/update آیتم‌ها
    eager: true, // برای لود اتوماتیک آیتم‌ها با خود فاکتور
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  proformaGoods: ProformaGoods[];

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;
}
