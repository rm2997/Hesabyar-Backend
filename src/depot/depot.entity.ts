import { DepotTypes } from 'src/common/decorators/depotTypes.enum';
import { Customer } from 'src/customer/customer.entity';
import { Good } from 'src/goods/good.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DepotGoods } from './depot-goods.entity';
import { Invoice } from 'src/invoice/invoice.entity';

@Entity()
export class Depot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DepotTypes, default: DepotTypes.in })
  depotType: DepotTypes;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  depotInvoice: Invoice[];

  @OneToMany(() => DepotGoods, (item) => item.depot, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  depotGoods: DepotGoods[];

  @Column({ nullable: true, default: 0 })
  totalAmount: number;

  @Column({ nullable: false, default: 1 })
  totalQuantity: number;

  @Column({ nullable: true })
  isAccepted: string;

  @Column({ nullable: true })
  driver: string;

  @Column({ length: 11, nullable: true })
  driverCarNumber: string;

  @Column({ length: 10, nullable: true })
  driverNatCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  acceptedBy: User;
}
