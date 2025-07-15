import { DepotTypes } from 'src/common/decorators/depotTypes.enum';
import { Customer } from 'src/customer/customer.entity';
import { Good } from 'src/goods/good.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Depot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DepotTypes, default: DepotTypes.in })
  depotType: DepotTypes;

  @Column({ nullable: true })
  depotInfo: string;

  @ManyToOne(() => Good, (good) => good.goodDepot, {
    onDelete: 'SET NULL',
  })
  depotGood: Good;

  @Column({ nullable: true })
  goodSerial: string;

  @Column({ nullable: true })
  goodImage: string;

  @Column({ nullable: true, default: 0 })
  totalAmount: number;

  @Column({ nullable: false, default: 1 })
  quantity: number;

  @ManyToOne(() => Customer, (c) => c.id, { nullable: false })
  deliveredBy: Customer;

  @Column({ nullable: false })
  deliveredAt: Date;

  @Column({ nullable: true })
  isAccepted: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  acceptedBy: User;
}
