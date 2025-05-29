import { Injectable, NotFoundException } from '@nestjs/common';
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
    const customer = this.customerRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.customerRepository.save(customer);
    return saved;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find();
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException();
    console.log(customer);

    return customer;
  }

  async updateCustomer(
    id: number,
    data: Partial<Customer>,
  ): Promise<Customer | null> {
    const customer = await this.customerRepository.findOne({
      where: { id: id },
    });
    if (!customer) throw new NotFoundException();
    customer.customerFName = data?.customerFName!;
    customer.customerLName = data?.customerLName!;
    customer.customerAddress = data?.customerAddress!;
    customer.customerNationalCode = data?.customerNationalCode!;
    customer.customerPhone = data?.customerPhone!;
    customer.customerMobile = data?.customerMobile!;
    customer.customerGender = data?.customerGender!;
    customer.customerPostalCode = data?.customerPostalCode!;
    console.log(customer);

    return this.customerRepository.save(customer);
  }

  async deleteCustomer(id: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: id },
    });
    if (!customer) throw new NotFoundException();

    await this.customerRepository.delete(id);
  }
}
