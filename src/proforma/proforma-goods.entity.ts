import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Proforma } from './proforma.entity';

@Entity()
export class ProformaGoods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  total: number;

  @ManyToOne(() => Proforma, (proforma) => proforma.proformaGoods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proforma: Proforma[];

  @ManyToOne(() => Good, (good) => good.goodProforma, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  good: Good[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;
}
