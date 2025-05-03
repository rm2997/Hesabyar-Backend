import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  IsNull,
} from 'typeorm';
import { Notification } from 'src/notification/notification.entity';
import { Roles } from 'src/common/decorators/roles.enum';
import { Customer } from 'src/customer/customer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string; // hashed

  @Column({ type: 'enum', enum: Roles })
  role: Roles;

  @Column()
  userfname: string;

  @Column()
  userlname: string;

  @Column()
  usermobilenumber: string;

  @OneToMany(() => Notification, (notification) => notification.fromuser)
  usernotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.touser)
  assignednotifications: Notification[];

  @OneToMany(() => Customer, (customer) => customer.id)
  customers: Customer[];
}
