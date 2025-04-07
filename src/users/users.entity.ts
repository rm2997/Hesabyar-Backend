import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Notification } from 'src/notification/notification.entity';
import { Roles } from 'src/common/decorators/roles.enum';

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

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
