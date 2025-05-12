import { Good } from 'src/goods/good.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unitName: string;

  @Column({ nullable: true })
  unitInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
