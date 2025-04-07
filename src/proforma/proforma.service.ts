import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proforma } from './proforma.entity';
import { User } from 'src/users/users.entity';

// این سرویس برای مدیریت عملیات‌های مختلف مانند ذخیره، حذف، ویرایش پیش‌فاکتور استفاده می‌شود
@Injectable()
export class ProformaService {
  constructor(
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
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

    return this.proformaRepository.save(proforma); // ذخیره پیش‌فاکتور در دیتابیس
  }

  // این متد برای بازیابی پیش‌فاکتور با شناسه مشخص است
  async getProforma(id: number): Promise<Proforma | null> {
    return this.proformaRepository.findOne({ where: { id } }); // پیدا کردن پیش‌فاکتور بر اساس شناسه
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
}
