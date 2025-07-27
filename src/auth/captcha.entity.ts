import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('captcha')
export class Captcha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  text: string;

  @Column()
  ip: string;

  @Column()
  userName: string;

  @Column({ default: 0 })
  failedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: Boolean, default: false })
  isUsed: boolean;
}
