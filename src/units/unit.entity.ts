import { Good } from 'src/goods/good.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @UpdateDateColumn()
  updateAt: Date;

  @Column({ type: 'nvarchar', nullable: true })
  sepidarId: string;

  @OneToMany(() => Good, (good) => good.goodUnit)
  goods: Good[];

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
