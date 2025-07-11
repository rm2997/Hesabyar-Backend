import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'آقای', nullable: true })
  customerGender: string;

  @Column()
  customerFName: string;

  @Column()
  customerLName: string;

  @Column({ nullable: true })
  customerAddress: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: false, unique: true })
  customerMobile: string;

  @Column({ nullable: true })
  customerNationalCode: string;

  @Column({ nullable: true, length: 10 })
  customerPostalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
