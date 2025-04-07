import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { ProformaService } from '../proforma/proforma.service'; // وارد کردن سرویس پیش‌فاکتور برای استفاده از اطلاعات پیش‌فاکتور

// این سرویس برای مدیریت عملیات‌های مختلف مانند ذخیره، حذف، ویرایش فاکتور استفاده می‌شود
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    private proformaService: ProformaService, // استفاده از سرویس پیش‌فاکتور
  ) {}

  // این متد برای ایجاد یک فاکتور جدید است
  async createInvoice(
    proformaId: number,
    customerId: number,
    totalAmount: number,
    paymentStatus: string,
  ): Promise<Invoice> {
    const proforma = await this.proformaService.getProforma(proformaId); // دریافت پیش‌فاکتور مربوطه
    if (!proforma) {
      throw new Error('Proforma not found');
    }

    const invoice = new Invoice();
    invoice.proforma = proforma; // ارتباط فاکتور با پیش‌فاکتور
    invoice.customerId = customerId;
    invoice.date = new Date(); // تاریخ فاکتور به صورت خودکار پر می‌شود
    invoice.totalAmount = totalAmount;
    invoice.paymentStatus = paymentStatus;

    return this.invoiceRepository.save(invoice); // ذخیره فاکتور در دیتابیس
  }

  // این متد برای بازیابی فاکتور با شناسه مشخص است
  async getInvoice(id: number): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({ where: { id } }); // پیدا کردن فاکتور بر اساس شناسه و بارگذاری پیش‌فاکتور مرتبط
  }

  // این متد برای به روزرسانی اطلاعات فاکتور است
  async updateInvoice(id: number, paymentStatus: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (invoice) {
      invoice.paymentStatus = paymentStatus;
      return this.invoiceRepository.save(invoice); // به روزرسانی وضعیت پرداخت فاکتور
    }
    throw new Error('Invoice not found');
  }

  // این متد برای حذف فاکتور است
  async deleteInvoice(id: number): Promise<void> {
    await this.invoiceRepository.delete(id); // حذف فاکتور از دیتابیس
  }
}
