import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { Proforma } from './proforma.entity';
import { User } from 'src/users/users.entity';
import { ConfigService } from '@nestjs/config';
import { ProformaGoods } from './proforma-goods.entity';
import { SmsService } from 'src/sms/sms.service';
import { NotificationService } from 'src/notification/notification.service';
import { UsersService } from 'src/users/users.service';
import { Notification } from 'src/notification/notification.entity';
import { CustomerPhone } from 'src/customer/customer-phone.entity';
import { PhoneTypes } from 'src/common/decorators/phoneTypes.enum';
import { MssqlService } from 'src/mssql/mssql.service';

@Injectable()
export class ProformaService {
  constructor(
    private readonly mssqlService: MssqlService,
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
    @InjectRepository(ProformaGoods)
    private proformaGoodsRepository: Repository<ProformaGoods>,
    @InjectRepository(CustomerPhone)
    private readonly customerPhoneRepository: Repository<CustomerPhone>,
    private readonly dataSource: DataSource,
    private configService: ConfigService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  async createProforma(data: Partial<Proforma>, user: User): Promise<Proforma> {
    const customerPrimaryMobile = data.customer?.phoneNumbers.find(
      (phone) =>
        phone.isPrimary == true && phone.phoneType == PhoneTypes.mobile,
    );
    if (!customerPrimaryMobile || !customerPrimaryMobile?.phoneNumber)
      throw new BadRequestException(
        'مشتری انتخاب شده شماره موبایل پیش فرض ندارد',
      );
    const dbUser = await this.usersService.findById(user.id);
    if (!dbUser)
      throw new BadRequestException('کاربر ثبت کننده پیش فاکتور معتبر نیست');
    if (!dbUser?.sepidarId)
      new BadRequestException('کاربر معادل سپیدار تنظیم نشده است');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const proformaGoods = [...data?.proformaGoods!];

      // proformaGoods.map((item) => {
      //   item.createdBy = user;
      // });

      const proforma = queryRunner.manager.create(Proforma, {
        title: data?.title,
        customer: data.customer,
        totalAmount: data.totalAmount,
        stockRef: data.stockRef,
        fiscalYear: data.fiscalYear,
        createdBy: dbUser,
      });

      console.log('input Data is:', data);
      console.log('Proforma Data is:', proforma);

      const savedProforma = await queryRunner.manager.save(proforma);
      console.log('After save:', savedProforma);

      const shareableLink = await this.generateShareableLink(savedProforma.id);
      savedProforma.customerLink = shareableLink;

      const proformaGoods = data?.proformaGoods?.map((item) =>
        queryRunner.manager.create(ProformaGoods, {
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          good: item.good,
          proforma: savedProforma,
          createdBy: user,
        }),
      );

      await queryRunner.manager.save(savedProforma);
      await queryRunner.manager.save(proformaGoods);

      const { quotationNumber, quotationId } =
        await this.mssqlService.createQuotation(savedProforma, proformaGoods!);
      if (!quotationNumber)
        throw new BadRequestException('درج در سپیدار انجام نشد');

      savedProforma.proformaNumber = quotationNumber;
      savedProforma.sepidarId = quotationId + '';
      await queryRunner.manager.save(savedProforma);

      await queryRunner.commitTransaction();

      return savedProforma;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: Proforma[]; total: number }> {
    const query = this.dataSource
      .getRepository(Proforma)
      .createQueryBuilder('proforma')
      .leftJoinAndSelect('proforma.createdBy', 'user')
      .leftJoinAndSelect('proforma.customer', 'customer')
      .leftJoinAndSelect('proforma.proformaGoods', 'proformaGoods')
      .leftJoinAndSelect('proformaGoods.good', 'good');

    if (search) {
      query.andWhere('proforma.id= :id', { id: search });
    }

    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('proforma.createdAt', 'DESC')
      .getMany();
    return { total, items };
  }

  async getProforma(id: number): Promise<Proforma | null> {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    return proforma;
  }

  async getAllByUser(
    page: number,
    limit: number,
    search: string,
    user: Partial<User>,
  ): Promise<{ items: Proforma[]; total: number }> {
    const query = this.dataSource
      .getRepository(Proforma)
      .createQueryBuilder('proforma')
      .leftJoinAndSelect('proforma.createdBy', 'user')
      .leftJoinAndSelect('proforma.customer', 'customer')
      .leftJoinAndSelect('proforma.proformaGoods', 'proformaGoods')
      .leftJoinAndSelect('proformaGoods.good', 'good')
      .andWhere('proforma.createdBy= :user', { user: user.id });

    if (search) {
      query.andWhere('proforma.id= :id', { id: search });
    }

    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('proforma.createdAt', 'DESC')
      .getMany();
    return { total, items };
  }

  async getAcceptedProformasByUserId(
    page: number,
    limit: number,
    search: string,
    user: Partial<User>,
  ): Promise<{ items: Proforma[]; total: number }> {
    const query = this.dataSource
      .getRepository(Proforma)
      .createQueryBuilder('proforma')
      .leftJoinAndSelect('proforma.createdBy', 'user')
      .leftJoinAndSelect('proforma.customer', 'customer')
      .leftJoinAndSelect('proforma.proformaGoods', 'proformaGoods')
      .leftJoinAndSelect('proformaGoods.good', 'good')
      .andWhere('proforma.createdBy= :user', { user: user.id })
      .andWhere('proforma.isAccepted=1')
      .andWhere('proforma.isConverted=0');

    if (search) {
      query.andWhere('proforma.id= :id', { id: search });
    }

    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('proforma.createdAt', 'DESC')
      .getMany();
    return { total, items };
  }

  async getAcceptedProformasByCustomerId(
    customerId: number,
    page: number,
    limit: number,
    search: string,
    user: Partial<User>,
  ): Promise<{ items: Proforma[]; total: number }> {
    const query = this.dataSource
      .getRepository(Proforma)
      .createQueryBuilder('proforma')
      .leftJoinAndSelect('proforma.createdBy', 'user')
      .leftJoinAndSelect('proforma.customer', 'customer')
      .leftJoinAndSelect('proforma.proformaGoods', 'proformaGoods')
      .leftJoinAndSelect('proformaGoods.good', 'good')
      .where('proforma.customer= :customer', { customer: customerId })
      .andWhere('proforma.createdBy= :user', { user: user.id })
      .andWhere('proforma.isAccepted=1')
      .andWhere('proforma.isConverted=0');

    if (search) {
      query.andWhere('proforma.id= :id', { id: search });
    }

    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('proforma.createdAt', 'DESC')
      .getMany();
    return { total, items };
  }

  async updateProforma(
    id: number,
    data: Partial<Proforma>,
    updatedBy: User,
  ): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({
      where: { id },
      relations: ['proformaGoods'],
    });
    if (!proforma) throw new NotFoundException('پیش‌فاکتور وجود ندارد');
    proforma.totalAmount = data?.totalAmount!;
    data?.proformaGoods?.map((g) => {
      if (g.id == 0) {
        g.createdAt = new Date();
        g.createdBy = updatedBy;
      } else {
        g.createdBy = updatedBy;
      }
    });
    await this.proformaGoodsRepository.remove(proforma.proformaGoods);
    proforma.proformaGoods = [...data?.proformaGoods!];
    return await this.proformaRepository.save({ ...proforma, ...data });
  }

  async updateProformaByPublicCustomer(proforma: Proforma) {
    const saved = await this.updateProforma(
      proforma?.id,
      proforma,
      proforma.createdBy,
    );

    const admins: User[] = await this.usersService.getAdminUsers();
    if (!admins || admins?.length == 0) return saved;
    admins.forEach(async (user) => {
      const notif = new Notification();
      notif.fromUser = proforma.createdBy;
      notif.toUser = user;
      notif.message = ` همکار گرامی لطفا جهت تایید پیش فاکتور شماره ${proforma.id} اقدام فرمایید`;
      notif.title = ` تایید پیش فاکتور شماره ${proforma.id}`;
      await this.notificationService.createNotification(
        notif,
        proforma.createdBy,
      );
    });
    return saved;
  }

  async setProformaIsAccepted(id: number, acceptedBy: User) {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (!proforma) throw new NotFoundException('پیش‌ فاکتور وجود ندارد');
    return await this.proformaRepository.save({
      ...proforma,
      isAccepted: true,
      acceptedBy: acceptedBy,
    });
  }

  async setProformaIsSent(id: number) {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (!proforma) throw new NotFoundException('پیش‌ فاکتور وجود ندارد');
    const token = await this.generateShareableLink(proforma.id);
    const mobileNumber = await this.customerPhoneRepository.findOne({
      where: {
        phoneType: PhoneTypes.mobile,
        isPrimary: true,
        customer: { id: proforma.customer.id },
      },
    });
    const smsResult = await this.smsService.sendUpdateProformaSms(
      proforma.customer,
      mobileNumber?.phoneNumber!,
      token,
    );
    if (smsResult.status !== 1)
      throw new BadRequestException(
        'ارسال پیامک شکست خورد ' + smsResult.message,
      );
    return await this.proformaRepository.save({
      ...proforma,
      isSent: true,
      customerLink: token,
    });
  }

  async convertToInvoice(id: number, user: User): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({ where: { id } });

    if (!proforma) throw new NotFoundException('پیش‌ فاکتور وجود ندارد');
    proforma.isConverted = true;
    proforma.convertedBy = user;
    return await this.proformaRepository.save(proforma);
  }

  async deleteProforma(id: number) {
    return await this.proformaRepository.delete(id);
  }

  async generateShareableLink(proformaId: number): Promise<string> {
    const payload = { proformaId };
    const secret = this.configService.get('PROFORMA_LINK_SECRET');
    const expiresIn = this.configService.get('PROFORMA_LINK_EXPIRES_IN');

    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  }

  async renewProformaToken(proformaId: number) {
    try {
      const proforma = await this.proformaRepository.findOne({
        where: { id: proformaId },
      });
      if (!proforma) throw new NotFoundException('پیش‌ فاکتور وجود ندارد');
      const newToken = await this.generateShareableLink(proformaId);
      proforma.customerLink = newToken;
      proforma.isSent = false;
      proforma.approvedFile = '';
      await this.proformaRepository.save(proforma);
      return { message: 'توکن جدید صادر شد' };
    } catch (error) {}
  }

  async verifyAndFetchProforma(token: string): Promise<Proforma> {
    try {
      const secret = this.configService.get('PROFORMA_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const proforma = await this.proformaRepository.findOne({
        where: { id: payload.proformaId },
        relations: ['createdBy', 'proformaGoods'],
      });
      console.log('Start fetching proforma to show to customer:', payload);

      if (!proforma) throw new NotFoundException('پیش‌فاکتور یافت نشد');
      return proforma;
    } catch (err) {
      throw new NotFoundException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
