import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { DataSource, Not, Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  async createCustomer(
    data: Partial<Customer>,
    user: number,
  ): Promise<Customer> {
    const mobileExist = await this.customerRepository.findOne({
      where: { customerMobile: data.customerMobile },
    });
    if (mobileExist)
      throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');

    const natcodeExist = await this.customerRepository.findOne({
      where: { customerNationalCode: data.customerNationalCode },
    });
    if (natcodeExist)
      throw new BadRequestException('امکان درج شماره ملی تکراری وجود ندارد');

    const customer = this.customerRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.customerRepository.save(customer);
    return saved;
  }

  async getAllCustomers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Customer[] }> {
    const query = this.dataSource
      .getRepository(Customer)
      .createQueryBuilder('customer');

    if (search && search.trim().length > 0) {
      query
        .andWhere('customer.customerLName LIKE :search', {
          search: `%${search}%`,
        })
        .orWhere('customer.customerFName LIKE :search', {
          search: `%${search}%`,
        });
    }
    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('customer.id', 'DESC')
      .getMany();

    return { total, items };
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
    const exist = await this.customerRepository.findOne({
      where: { customerMobile: data.customerMobile, id: Not(id) },
    });
    if (exist)
      throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');

    const natcodeExist = await this.customerRepository.findOne({
      where: { customerNationalCode: data.customerNationalCode, id: Not(id) },
    });
    if (natcodeExist)
      throw new BadRequestException('امکان درج شماره ملی تکراری وجود ندارد');

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
