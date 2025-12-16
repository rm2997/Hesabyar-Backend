import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { DataSource, Not, Repository, TypeORMError } from 'typeorm';
import { CustomerAddress } from './customer-address.entity';
import { CustomerPhone } from './customer-phone.entity';
import { PhoneTypes } from 'src/common/decorators/phoneTypes.enum';
import { User } from 'src/users/users.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerAddress)
    private readonly customerAddressRepository: Repository<CustomerAddress>,
    @InjectRepository(CustomerPhone)
    private readonly customerPhoneRepository: Repository<CustomerPhone>,
    private readonly dataSource: DataSource,
  ) { }

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
    if (nameExist) {
      throw new BadRequestException('این مشتری قبلا ثبت شده است');
    }
    if (data.customerNationalCode) {
      const natcodeExist = await this.customerRepository.findOne({
        where: { customerNationalCode: data.customerNationalCode },
      });
      if (natcodeExist) {
        throw new BadRequestException('امکان درج شماره ملی تکراری وجود ندارد');
      }
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newCustomer = queryRunner.manager.create(Customer, {
        ...data,
        createdAt: new Date(),
        createdBy: { id: user },
      });
      await queryRunner.manager.save(Customer, newCustomer);
      if (data?.phoneNumbers && data?.phoneNumbers?.length > 0) {
        for (const phone of data?.phoneNumbers) {
          const existPhone = await queryRunner.manager.findOne(CustomerPhone, {
            where: { phoneNumber: phone.phoneNumber },
          });
          if (!existPhone) {
            const newPhone = queryRunner.manager.create(CustomerPhone, {
              ...phone,
              customer: newCustomer,
              createdAt: new Date(),
              createdBy: { id: user },
            });
            await queryRunner.manager.save(CustomerPhone, newPhone);
          }
        }
      }

      if (data?.locations && data?.locations?.length > 0) {
        for (const location of data?.locations) {
          const existLocation = await queryRunner.manager.findOne(
            CustomerAddress,
            {
              where: { postalCode: location.postalCode },
            },
          );
          if (!existLocation) {
            const newL = queryRunner.manager.create(CustomerAddress, {
              ...location,
              customer: newCustomer,
              createdAt: new Date(),
              createdBy: { id: user },
            });
            await queryRunner.manager.save(CustomerAddress, newL);
          }
        }
      }

      await queryRunner.commitTransaction();

      return newCustomer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'بروز رسانی اطلاعات با مشکل مواجه شد' + ' ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAllCustomers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Customer[] }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const query = queryRunner.manager
        .getRepository(Customer)
        .createQueryBuilder('customer')
        .leftJoinAndSelect('customer.phoneNumbers', 'phoneNumbers')
        .leftJoinAndSelect('customer.locations', 'locations');

      if (search && search.trim().length > 0) {
        isNaN(Number(search))
          ? query
            .andWhere('customer.customerLName LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('customer.customerFName LIKE :search', {
              search: `%${search}%`,
            })
          : query
            .andWhere('customer.sepidarDlId= :search', {
              search: search,
            })
            .orWhere('customer.customerNationalCode= :search', {
              search: search,
            })
            .orWhere('phoneNumbers.phoneNumber= :search', {
              search: search,
            });
      }
      const total = await query.getCount();

      const items = await query
        .skip(limit == -1 ? 0 : (page - 1) * limit)
        .take(limit == -1 ? undefined : limit)
        .orderBy('customer.id', 'DESC')
        .getMany();

      await queryRunner.commitTransaction();
      return { total, items };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error?.message);
    } finally {
      await queryRunner.release();
    }
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
    user: User,
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

    if (data.customerNationalCode) {
      const natcodeExist = await this.customerRepository.findOne({
        where: { customerNationalCode: data.customerNationalCode, id: Not(id) },
      });
      if (natcodeExist) {
        throw new BadRequestException('امکان درج شماره ملی تکراری وجود ندارد');
      }
    }

    for (const phone of data?.phoneNumbers!) {
      const mobileExist = await this.customerPhoneRepository.findOne({
        where: {
          phoneNumber: phone.phoneNumber,
          customer: { id: Not(id) },
        },
      });
      if (mobileExist != null) {
        throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');
      }
    }

    const existingCustomer = await this.customerRepository.findOne({
      where: { id: id },
      relations: ['phoneNumbers', 'locations'],
    });
    if (!existingCustomer)
      throw new NotFoundException('مشتری مورد نظر موجود نیست');

    for (const phone of data?.phoneNumbers!) {
      phone.createdBy = user;
      phone.createdAt = new Date();
    }
    for (const location of data?.locations!) {
      location.createdBy = user;
      location.createdAt = new Date();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      queryRunner.manager.merge(Customer, existingCustomer, {
        ...data,
      });
      await queryRunner.manager.save(existingCustomer);
      await queryRunner.commitTransaction();
      return await this.customerRepository.findOne({
        where: { id },
        relations: ['phoneNumbers', 'locations'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'بروزرسانی اطلاعات با مشکل مواجه شد' + ' ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
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

  async deleteCustomerPhone(phoneId: number): Promise<void> {
    const customerPhone = await this.customerPhoneRepository.findOne({
      where: { id: phoneId },
    });
    if (!customerPhone)
      throw new NotFoundException('شماره مورد نظر وجود ندارد');

    try {
      await this.customerPhoneRepository.delete(customerPhone);
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

  async deleteCustomerLocation(locationId: number): Promise<void> {
    const customerLocation = await this.customerAddressRepository.findOne({
      where: { id: locationId },
    });
    if (!customerLocation)
      throw new NotFoundException('آدرس مورد نظر وجود ندارد');

    try {
      await this.customerAddressRepository.delete(customerLocation);
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
