import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { Public } from 'src/common/decorators/jwt.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { PaymentTypes } from 'src/common/decorators/payment.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() data: Partial<Invoice>, @Req() req: Request) {
    const user = req.user as User;
    console.log('Invoice data:', JSON.stringify(data));

    return await this.invoiceService.createInvoice(data, user.id);
  }

  @Get()
  async getAll() {
    return await this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.invoiceService.getInvoice(id);
  }

  @Get('user/my')
  async getUserInvoices(@Req() req: Request) {
    const user = req.user as User;
    return this.invoiceService.getUserInvoices(user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('paymentStatus') paymentStatus: PaymentTypes,
  ) {
    return await this.invoiceService.updateInvoice(id, paymentStatus);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.invoiceService.deleteInvoice(id);
  }

  @Get('share-link/:id')
  async getShareableLink(@Param('id') id: number) {
    return {
      link: await this.invoiceService.generateShareableLink(id),
    };
  }

  @Get('view/:token')
  @Public()
  async viewProforma(@Param('token') token: string) {
    return await this.invoiceService.verifyAndFetchProforma(token);
  }
}
