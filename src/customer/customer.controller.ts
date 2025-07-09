import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  async create(@Body() data: any, @Req() req: Request) {
    const user = req.user as User;
    return this.customerService.createCustomer(data, user.id);
  }

  @Get()
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
  ) {
    return await this.customerService.getAllCustomers(page, limit, search);
  }

  @Get(':id')
  async getCustomer(@Param('id') id: number) {
    const customer = await this.customerService.getCustomerById(id);
    console.log(customer);

    return customer;
  }

  @Put(':id')
  async updateCustomer(
    @Param('id') id: number,
    @Body() data: Partial<Customer>,
  ) {
    return await this.customerService.updateCustomer(id, data);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: number) {
    return await this.customerService.deleteCustomer(id);
  }
}
