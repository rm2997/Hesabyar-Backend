import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { AddressTypes } from '../common/decorators/addressTypes.enum';
import { User } from 'src/users/users.entity';

@Entity()
export class CustomerAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.locations, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @Column({ type: 'enum', enum: AddressTypes, default: AddressTypes.home })
  locationType: AddressTypes;

  @Column({ default: false, nullable: false })
  isPrimary: boolean;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  location: string;

  @Column({ nullable: true, length: 10 })
  postalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
