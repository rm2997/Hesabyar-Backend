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

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  totalAmount: number;

  @Column({ type: 'enum', enum: PaymentTypes, default: PaymentTypes.Cash })
  paymentStatus: PaymentTypes;

  @Column({ nullable: true })
  approvedFile: string;

  @Column({ nullable: true })
  customerLink: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Good, (good) => good.id)
  goods: Good[];

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;
}
