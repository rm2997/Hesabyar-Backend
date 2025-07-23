import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Customer } from 'src/customer/customer.entity';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { ProformaGoods } from './proforma-goods.entity';
import { Banks } from 'src/common/decorators/banks.enum';

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
    eager: true,
    onDelete: 'RESTRICT',
  })
  convertedBy: User | null;

  @Column({ type: 'bool', nullable: true, default: false })
  isAccepted: boolean;

  @ManyToOne(() => User, (user) => user.userAcceptedProforma, {
    nullable: true,
    eager: true,
    onDelete: 'RESTRICT',
  })
  acceptedBy: User | null;

  @ManyToOne(() => Customer, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
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

  @Column({ type: 'enum', enum: Banks, default: Banks.Meli })
  chequeIssuerName: Banks;

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
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  proformaGoods: ProformaGoods[];

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  createdBy: User;
}
