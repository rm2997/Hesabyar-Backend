import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { DataSource, Not, Repository, TypeORMError } from 'typeorm';

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
    const nameExist = await this.customerRepository.findOne({
      where: {
        customerFName: data.customerFName?.trim(),
        customerLName: data.customerLName?.trim(),
      },
    });
    if (nameExist != null) {
      throw new BadRequestException('این مشتری قبلا ثبت شده است');
    }

    const mobileExist = await this.customerRepository.findOne({
      where: { customerMobile: data.customerMobile },
    });

    if (mobileExist != null) {
      throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');
    }

    if (data.customerNationalCode) {
      const natcodeExist = await this.customerRepository.findOne({
        where: { customerNationalCode: data.customerNationalCode },
      });
      if (natcodeExist) {
        throw new BadRequestException('امکان درج شماره ملی تکراری وجود ندارد');
      }
    }

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
    const nameExist = await this.customerRepository.findOne({
      where: {
        customerFName: data.customerFName?.trim(),
        customerLName: data.customerLName?.trim(),
        id: Not(id),
      },
    });
    if (nameExist != null) {
      throw new BadRequestException(
        'امکان استفاده از این نام و نام خانوادگی وجود ندارد، این اطلاعات تکراری است',
      );
    }

    const mobileExist = await this.customerRepository.findOne({
      where: { customerMobile: data.customerMobile, id: Not(id) },
    });

    if (mobileExist != null) {
      throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');
    }

    if (data.customerNationalCode) {
      const natcodeExist = await this.customerRepository.findOne({
        where: { customerNationalCode: data.customerNationalCode, id: Not(id) },
      });
      if (natcodeExist) {
        throw new BadRequestException('امکان درج شماره ملی تکراری وجود ندارد');
      }
    }
    const customer = await this.customerRepository.findOne({
      where: { id: id },
    });
    if (!customer) throw new NotFoundException('مشتری مورد نظر موجود نیست');

    const saved = await this.customerRepository.save({ ...customer, ...data });
    console.log('saved:', saved);
    return saved;
  }

  async deleteCustomer(id: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: id },
    });
    if (!customer) throw new NotFoundException('مشتری مورد نظر وجود ندارد');

    try {
      await this.customerRepository.delete(id);
    } catch (error) {
      console.log(error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451)
        throw new BadRequestException(
          'اطلاعات این مشتری درحال استفاده میباشد، امکان حذف وجود ندارد',
        );
      else
        throw new BadRequestException('خطای داخلی سرور، امکان حذف وجود ندارد');
    }
  }
}
