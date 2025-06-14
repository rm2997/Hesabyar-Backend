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

  @Column()
  goodPrice: number;

  @Column({ nullable: true })
  goodInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'nvarchar', nullable: true })
  sepidarId: string;

  @OneToMany(() => InvoiceGoods, (item) => item.good, {
    cascade: true, // برای auto insert/update آیتم‌ها
  })
  @JoinColumn()
  goodInvoice: InvoiceGoods[];

  @OneToMany(() => ProformaGoods, (item) => item.good, {
    cascade: true, // برای auto insert/update آیتم‌ها
  })
  @JoinColumn()
  goodProforma: ProformaGoods[];

  @ManyToOne(() => Unit, (unit) => unit.goods, {
    eager: true,
    onDelete: 'SET NULL',
  })
  goodUnit: Unit;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
  good: { id: number };
}
