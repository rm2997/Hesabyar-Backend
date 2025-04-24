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

// این سرویس برای مدیریت عملیات‌های مختلف مانند ذخیره، حذف، ویرایش پیش‌فاکتور استفاده می‌شود
@Injectable()
export class ProformaService {
  constructor(
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
    private configService: ConfigService,
  ) {}

  // این متد برای ایجاد یک پیش‌فاکتور جدید است
  async createProforma(data: Partial<Proforma>, user: User): Promise<Proforma> {
    const proforma = this.proformaRepository.create({
      ...data,

      createdAt: new Date(),
      createdBy: { id: user.id },
    });
    // proforma.customerName = data.customerName + '';
    proforma.createdAt = new Date(); // تاریخ پیش‌فاکتور به صورت خودکار پر می‌شود
    // proforma.totalAmount = data.totalAmount!;
    // proforma.createdBy = user.id;

    const savedProforma = await this.proformaRepository.save(proforma); // ذخیره پیش‌فاکتور در دیتابیس
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
      console.log(res?.customerName);
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
  async updateProforma(id: number, totalAmount: number): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({ where: { id } });
    if (proforma) {
      proforma.totalAmount = totalAmount;
      return this.proformaRepository.save(proforma); // به روزرسانی پیش‌فاکتور
    }
    throw new Error('Proforma not found');
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
    const baseUrl = this.configService.get('APP_BASE_URL');

    return `${baseUrl}/proforma/view/${token}`;
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
      throw new UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
