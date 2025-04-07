import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProformaService } from './proforma.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Proforma } from './proforma.entity';
import { Request } from 'express';
import { User } from 'src/users/users.entity';

// این کنترلر برای مدیریت درخواست‌های HTTP مرتبط با پیش‌فاکتور استفاده می‌شود
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proforma')
export class ProformaController {
  constructor(private readonly proformaService: ProformaService) {}

  // این متد برای ایجاد یک پیش‌فاکتور جدید است
  @Post()
  async create(@Body() data: Partial<Proforma>, @Req() req: Request) {
    const user = req.user as User;
    return this.proformaService.createProforma(data, user);
  }

  // این متد برای دریافت پیش‌فاکتور بر اساس شناسه است
  @Get(':id')
  async get(@Param('id') id: number) {
    return this.proformaService.getProforma(id);
  }

  // این متد برای به روزرسانی پیش‌فاکتور است
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('totalAmount') totalAmount: number,
  ) {
    return this.proformaService.updateProforma(id, totalAmount);
  }

  // این متد برای حذف پیش‌فاکتور است
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.proformaService.deleteProforma(id);
  }
}
