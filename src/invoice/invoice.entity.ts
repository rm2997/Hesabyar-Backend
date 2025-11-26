import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Proforma } from '../proforma/proforma.entity';
import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Customer } from 'src/customer/customer.entity';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { InvoiceGoods } from './invoice-good.entity';
import { Banks } from 'src/common/decorators/banks.enum';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  invoiceNumber: number;

  @Column({ nullable: false })
  fiscalYear: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: Boolean, default: false })
  isSent: boolean;

  @Column({ type: 'bool', nullable: true, default: false })
  isAccepted: boolean;

  @ManyToOne(() => User, (user) => user.userAcceptedInvoice, {
    nullable: true,
  })
  acceptedBy: User;

  @UpdateDateColumn()
  updateAt: Date;

  @Column({ type: 'nvarchar', nullable: true })
  sepidarId: string;

  @ManyToOne(() => Proforma, { eager: true })
  @JoinColumn({ name: 'proforma_id' })
  proforma: Proforma;

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
  chequeSayad: string;

  @Column({ nullable: true })
  chequeSerial: string;

  @Column({ type: 'enum', enum: Banks, default: Banks.Meli })
  chequeIssuerName: Banks;

  @Column({ nullable: true })
  paperMoneyDate: Date;

  @Column('decimal', { nullable: true })
  paperMoneyAmount: number;

  @Column({ nullable: true })
  paperMoneySerial: string;

  @Column({ nullable: true })
  trustIssueDate: Date;

  @Column({ nullable: true })
  approvedFile: string;

  @Column({ nullable: true })
  customerLink: string;

  @OneToMany(() => InvoiceGoods, (item) => item.invoice, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  invoiceGoods: InvoiceGoods[];

  @Column({ nullable: true })
  driver: string;

  @Column({ length: 11, nullable: true })
  driverCarNumber: string;

  @Column({ length: 10, nullable: true })
  driverNatCode: string;

  @Column({ length: 11, nullable: true })
  driverMobile: string;

  @Column({ nullable: true })
  driverToken: string;

  @Column({ type: Boolean, default: false })
  driverTokenIsSent: boolean;

  @Column({ type: Boolean, default: false })
  finished: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;
}
