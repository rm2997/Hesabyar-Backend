import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { Proforma } from './proforma.entity';
import { User } from 'src/users/users.entity';
import { ConfigService } from '@nestjs/config';
import { ProformaGoods } from './proforma-goods.entity';
import { SmsService } from 'src/sms/sms.service';
import { response } from 'express';

@Injectable()
export class ProformaService {
  constructor(
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
    @InjectRepository(ProformaGoods)
    private proformaGoodsRepository: Repository<ProformaGoods>,
    private readonly dataSource: DataSource,
    private configService: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async createProforma(data: Partial<Proforma>, user: User): Promise<Proforma> {
    const proformaGoods = [...data?.proformaGoods!];

    proformaGoods.map((item) => {
      item.createdBy = user;
    });
    const proforma = this.proformaRepository.create({
      ...data,
      proformaGoods: [...proformaGoods],
      createdAt: new Date(),
      createdBy: { id: user.id },
    });

    const savedProforma = await this.proformaRepository.save(proforma);
    const shareableLink = await this.generateShareableLink(savedProforma.id);
    savedProforma.customerLink = shareableLink;
    return this.proformaRepository.save(savedProforma);
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
    const proforma = this.proformaRepository.findOne({ where: { id } }); // پیدا کردن پیش‌فاکتور بر اساس شناسه
    proforma.then((res) => {
      console.log(res?.customer);
    });
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
      .andWhere('proforma.isAccepted=1');

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
    if (proforma) {
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
      // //Remove deleted items
      // if (updatedItems?.length! < existItems.length) {
      //   const removedItems = existItems.filter(
      //     (item) => !updatedItems?.includes(item),
      //   );

      //   removedItems.map(
      //     async (item) => await this.proformaGoodsRepository.remove(item),
      //   );
      // }
    }
    throw new NotFoundException('پیش‌فاکتور وجود ندارد');
  }

  async setProformaIsAccepted(id: number, acceptedBy: User) {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (proforma) {
      return this.proformaRepository.save({
        ...proforma,
        isAccepted: true,
        acceptedBy: acceptedBy,
      });
    }
    throw new NotFoundException('پیش‌فاکتور وجود ندارد');
  }

  async setProformaIsSent(id: number) {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (proforma) {
      const smsResult = await this.smsService.sendUpdateProformaSms(
        proforma.customer,
        proforma.customerLink,
      );
      if (smsResult.status !== 1)
        throw new BadRequestException(
          'ارسال پیامک شکست خورد ' + smsResult.message,
        );
      return this.proformaRepository.save({ ...proforma, isSent: true });
    }
    throw new NotFoundException('پیش‌فاکتور وجود ندارد');
  }

  async convertToInvoice(id: number, user: User): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({ where: { id } });

    if (proforma) {
      proforma.isConverted = true;
      proforma.convertedBy = user;
      return this.proformaRepository.save(proforma);
    }
    throw new NotFoundException('پیش‌فاکتور وجود ندارد');
  }
  // این متد برای حذف پیش‌فاکتور است
  async deleteProforma(id: number): Promise<void> {
    await this.proformaRepository.delete(id); // حذف پیش‌فاکتور از دیتابیس
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
      if (!proforma) throw new NotFoundException('پیش‌فاکتور وجود ندارد');
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
        relations: ['createdBy'],
      });

      if (!proforma) throw new NotFoundException('پیش‌فاکتور یافت نشد');
      return proforma;
    } catch (err) {
      throw new NotFoundException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
