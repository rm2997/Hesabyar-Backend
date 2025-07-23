import { DepotGoods } from 'src/depot/depot-goods.entity';
import { Depot } from 'src/depot/depot.entity';
import { InvoiceGoods } from 'src/invoice/invoice-good.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { ProformaGoods } from 'src/proforma/proforma-goods.entity';
import { Proforma } from 'src/proforma/proforma.entity';
import { Unit } from 'src/units/unit.entity';
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

@Entity()
export class Good {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goodName: string;

  @Column({ default: 0 })
  goodPrice: number;

  @Column({ default: 0, nullable: false })
  goodCount: number;

  @Column({ nullable: true })
  goodInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'nvarchar', nullable: true })
  sepidarId: string;

  @OneToMany(() => InvoiceGoods, (item) => item.good, {
    cascade: true,
  })
  @JoinColumn()
  goodInvoice: InvoiceGoods[];

  @OneToMany(() => ProformaGoods, (item) => item.good, {
    cascade: true,
  })
  @JoinColumn()
  goodProforma: ProformaGoods[];

  @OneToMany(() => DepotGoods, (item) => item.good, {
    cascade: true,
  })
  @JoinColumn()
  goodDepot: DepotGoods[];

  @ManyToOne(() => Unit, (unit) => unit.goods, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  goodUnit: Unit;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
  good: { id: number };
}
