import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  IsNull,
  CreateDateColumn,
} from 'typeorm';
import { Notification } from 'src/notification/notification.entity';
import { Roles } from 'src/common/decorators/roles.enum';
import { Customer } from 'src/customer/customer.entity';
import { Good } from 'src/goods/good.entity';
import { Proforma } from 'src/proforma/proforma.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { Otp } from 'src/otp/otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Roles })
  role: Roles;

  @Column()
  userfname: string;

  @Column()
  userlname: string;

  @Column({ unique: true, length: 11 })
  usermobilenumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  userLocation: string;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ type: Boolean, nullable: false, default: 1 })
  twoFactorAuthntication: boolean;

  @Column({ type: Boolean, default: true })
  mustChangePassword: boolean;

  @Column({ type: Boolean, default: true })
  isUserActive: boolean;

  @Column({ nullable: true, type: 'char', length: 5 })
  capcha: string;

  @OneToMany(() => Proforma, (proforma) => proforma.acceptedBy)
  userAcceptedProforma: Proforma[];

  @OneToMany(() => Proforma, (proforma) => proforma.convertedBy)
  userConvertedProforma: Proforma[];

  @OneToMany(() => Invoice, (invoice) => invoice.acceptedBy)
  userAcceptedInvoice: Invoice[];

  @OneToMany(() => Notification, (notification) => notification.fromUser)
  usernotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.toUser)
  assignednotifications: Notification[];

  @OneToMany(() => Otp, (otp) => otp.toUser)
  userSentOtpCode: Otp[];

  @OneToMany(() => Customer, (customer) => customer.id)
  customers: Customer[];

  @OneToMany(() => Good, (good) => good.id)
  goods: Good[];

  @Column()
  sepidarId: string;
}
