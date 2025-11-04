import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerAddress } from './customer-address.entity';
import { CustomerPhone } from './customer-phone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerAddress, CustomerPhone]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
