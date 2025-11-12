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
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerAddress } from './customer-address.entity';
import { CustomerPhone } from './customer-phone.entity';

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

  @Column({ nullable: true, type: 'nvarchar', length: 30 })
  customerFName: string;

  @Column({ nullable: true, type: 'nvarchar', length: 70 })
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

  // @Column({
  //   type: 'enum',
  //   enum: AddressTypes,
  //   default: AddressTypes.wrokPlace,
  // })
  // customerAddressType: AddressTypes;

  // @Column({ nullable: true })
  // customerAddress: string;

  // @Column({
  //   type: 'enum',
  //   enum: PhoneTypes,
  //   default: PhoneTypes.mobile,
  // })
  // customerPhoneType: PhoneTypes;

  // @Column({ nullable: true })
  // customerPhone: string;

  // @Column({ nullable: false, unique: true })
  // customerMobile: string;

  @Column({ nullable: true, type: 'nvarchar', length: 15 })
  customerNationalCode: string;

  @Column({ nullable: true, type: 'nvarchar' })
  customerEconomicCode: string;

  // @Column({ nullable: true, length: 10 })
  // customerPostalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  createdBy: User;

  @OneToMany(() => CustomerAddress, (location) => location.customer, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  locations: CustomerAddress[];

  @OneToMany(() => CustomerPhone, (phone) => phone.customer, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  phoneNumbers: CustomerPhone[];

  @Column()
  sepidarId: number;
}
