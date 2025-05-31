import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Proforma } from './proforma.entity';
import { User } from 'src/users/users.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProformaService {
  constructor(
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
    private configService: ConfigService,
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

  // این متد برای بازیابی همه پیش‌فاکتور ها است
  async getAll(): Promise<Proforma[] | null> {
    return this.proformaRepository.find({ order: { createdAt: 'DESC' } });
  }

  // این متد برای بازیابی پیش‌فاکتور با شناسه مشخص است
  async getProforma(id: number): Promise<Proforma | null> {
    const proforma = this.proformaRepository.findOne({ where: { id } }); // پیدا کردن پیش‌فاکتور بر اساس شناسه
    proforma.then((res) => {
      console.log(res?.customer);
    });
    return proforma;
  }

  // این متد برای بازیابی پیش‌فاکتورهای هر کاربر است
  async getAllByUser(user: Partial<User>): Promise<Proforma[] | null> {
    return this.proformaRepository.find({
      where: { createdBy: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  // این متد برای به روزرسانی اطلاعات پیش‌فاکتور است
  async updateProforma(id: number, data: Partial<Proforma>): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (proforma) {
      // proforma.totalAmount = data?.totalAmount!;
      // proforma.customer = data?.customer!;
      // proforma.customerLink = data?.customerLink!;
      // proforma.approvedFile = data?.approvedFile!;

      return this.proformaRepository.save({ ...data });
    }
    throw new NotFoundException('پیش‌فاکتور وجود ندارد');
  }

  async setProformaIsSent(id: number) {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (proforma) {
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
      if (proforma) {
        const newToken = await this.generateShareableLink(proformaId);
        proforma.customerLink = newToken;
        proforma.isSent = false;
        proforma.approvedFile = '';
        await this.proformaRepository.save(proforma);
        return newToken;
      }
      throw new NotFoundException('پیش‌فاکتور وجود ندارد');
    } catch (error) {}
  }

  async verifyAndFetchProforma(token: string): Promise<Proforma> {
    try {
      const secret = this.configService.get('PROFORMA_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const proforma = await this.proformaRepository.findOne({
        where: { id: payload.proformaId },
        relations: ['createdBy'], // در صورت نیاز
      });

      if (!proforma) throw new NotFoundException('پیش‌فاکتور یافت نشد');
      return proforma;
    } catch (err) {
      throw new NotFoundException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
