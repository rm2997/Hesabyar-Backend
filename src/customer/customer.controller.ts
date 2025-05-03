import { Body, Controller, Post, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Request } from 'express';
import { User } from 'src/users/users.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() data: any, @Req() request: Request) {
    const user = request.user as User;
    return this.customerService.createCustomer(data, user.id);
  }
}
