import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { PhoneTypes } from 'src/common/decorators/phoneTypes.enum';
import { User } from 'src/users/users.entity';

@Entity()
export class CustomerPhone {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.phoneNumbers, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @Column({ type: 'enum', enum: PhoneTypes, default: PhoneTypes.home })
  phoneType: PhoneTypes;

  @Column({ type: 'nvarchar', length: 15, nullable: true })
  phoneNumber: string;

  @Column({ default: false, nullable: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
