import { Invoice } from 'src/invoice/invoice.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.id)
  invoice: Invoice;

  @Column({ nullable: true })
  saleInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  createdBy: User;
}
