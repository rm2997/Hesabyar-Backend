import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { Customer } from './customer.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() data: any, @Req() req: Request) {
    console.log(`hello data: ${data}`);

    const user = req.user as User;
    return this.customerService.createCustomer(data, user.id);
  }

  @Get()
  getAll() {
    return this.customerService.getAllCustomers();
  }
}
