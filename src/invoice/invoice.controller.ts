import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';

// این کنترلر برای مدیریت درخواست‌های HTTP مرتبط با فاکتور استفاده می‌شود
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // این متد برای ایجاد یک فاکتور جدید است
  @Post()
  async create(
    @Body('proformaId') proformaId: number,
    @Body('customerId') customerId: number,
    @Body('totalAmount') totalAmount: number,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.invoiceService.createInvoice(
      proformaId,
      customerId,
      totalAmount,
      paymentStatus,
    );
  }

  // این متد برای دریافت فاکتور بر اساس شناسه است
  @Get(':id')
  async get(@Param('id') id: number) {
    return this.invoiceService.getInvoice(id);
  }

  // این متد برای به روزرسانی فاکتور است
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.invoiceService.updateInvoice(id, paymentStatus);
  }

  // این متد برای حذف فاکتور است
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.invoiceService.deleteInvoice(id);
  }
}
