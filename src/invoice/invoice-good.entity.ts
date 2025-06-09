import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Invoice } from './invoice.entity';

@Entity()
export class InvoiceGoods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  total: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.invoiceGoods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  invoice: Invoice[];

  @ManyToOne(() => Good, (good) => good.goodInvoice, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  good: Good[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;
}
