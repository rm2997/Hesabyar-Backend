import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userSentOtpCode, {
    eager: true,
    onDelete: 'SET NULL',
  })
  toUser: User;

  @Column({ nullable: false })
  token: string;

  @Column({ unique: true, nullable: false })
  mobileNumber: string;

  @Column({ nullable: false, length: 6 })
  code: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Column({ nullable: false })
  expiresAt: Date;
}
