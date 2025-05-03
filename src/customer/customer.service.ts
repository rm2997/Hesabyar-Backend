import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(
    data: Partial<Customer>,
    user: number,
  ): Promise<Customer> {
    return this.customerRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
  }
}
