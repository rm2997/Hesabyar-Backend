import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Proforma } from '../proforma/proforma.entity';
import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Customer } from 'src/customer/customer.entity';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { InvoiceGoods } from './invoice-good.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'bool', nullable: true, default: false })
  isAccepted: boolean;

  @ManyToOne(() => User, (user) => user.userAcceptedInvoice, {
    nullable: true,
  })
  acceptedBy: User;

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

  @OneToMany(() => InvoiceGoods, (item) => item.invoice, {
    cascade: true, // برای auto insert/update آیتم‌ها
    eager: true, // برای لود اتوماتیک آیتم‌ها با خود فاکتور
  })
  @JoinColumn()
  invoiceGoods: InvoiceGoods[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;
}
