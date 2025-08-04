import { AddressTypes } from 'src/common/decorators/addressTypes.enum';
import { CustomerParties } from 'src/common/decorators/customerParties.enum';
import { CustomerTypes } from 'src/common/decorators/customerTypes.enum';
import { Genders } from 'src/common/decorators/gender.enum';
import { PhoneTypes } from 'src/common/decorators/phoneTypes.enum';
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

  @Column({ type: 'enum', enum: CustomerTypes, default: CustomerTypes.real })
  customerType: CustomerTypes;

  @Column({
    type: 'enum',
    enum: CustomerParties,
    default: CustomerParties.partyPhone,
  })
  customerBase: CustomerParties;

  @Column({ type: 'enum', enum: Genders, default: Genders.mr })
  customerGender: Genders;

  @Column()
  customerFName: string;

  @Column()
  customerLName: string;

  @Column({ nullable: true })
  customerTitle: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: Boolean;

  @Column({ type: 'boolean', default: false })
  isProvider: Boolean;

  @Column({ type: 'boolean', default: false })
  isCustomer: Boolean;

  @Column({ type: 'boolean', default: false })
  isBroker: Boolean;

  @Column({ type: 'boolean', default: false })
  isBuyerAgent: Boolean;

  @Column({
    type: 'enum',
    enum: AddressTypes,
    default: AddressTypes.wrokPlace,
  })
  customerAddressType: AddressTypes;

  @Column({ nullable: true })
  customerAddress: string;

  @Column({
    type: 'enum',
    enum: PhoneTypes,
    default: PhoneTypes.mobile,
  })
  customerPhoneType: PhoneTypes;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: false, unique: true })
  customerMobile: string;

  @Column({ nullable: true })
  customerNationalCode: string;

  @Column({ nullable: true })
  customerEconomicCode: string;

  @Column({ nullable: true, length: 10 })
  customerPostalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;
}
