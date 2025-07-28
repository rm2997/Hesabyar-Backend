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

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: 0 })
  price: number;

  @Column({ default: 0 })
  total: number;

  @ManyToOne(() => Proforma, (proforma) => proforma.proformaGoods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proforma: Proforma;

  @ManyToOne(() => Good, (good) => good.goodProforma, {
    eager: true,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn()
  good: Good[];

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  createdBy: User;
}
