import { Invoice } from 'src/invoice/invoice.entity';
import { Proforma } from 'src/proforma/proforma.entity';
import { Unit } from 'src/units/unit.entity';
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
export class Good {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goodName: string;

  @Column()
  goodPrice: number;

  @Column({ nullable: true })
  goodInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Unit, { eager: true })
  @JoinColumn({ name: 'good_id' })
  goodUnit: Unit;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
