import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.usernotifications, {
    eager: true,
    onDelete: 'SET NULL',
  })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.assignednotifications, {
    eager: true,
    onDelete: 'SET NULL',
  })
  toUser: User;
}
