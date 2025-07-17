import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Depot } from './depot.entity';
import { Customer } from 'src/customer/customer.entity';

@Entity()
export class DepotGoods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: 0 })
  price: number;

  @ManyToOne(() => Depot, (depot) => depot.depotGoods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  depot: Depot[];

  @ManyToOne(() => Good, (good) => good.goodDepot, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  good: Good[];

  @ManyToOne(() => Customer, (c) => c.id, { eager: true, nullable: false })
  issuedBy: Customer;

  @Column({ nullable: false })
  issuedAt: Date;

  @Column({ nullable: true })
  serial: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;
}
