import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { ProformaModule } from 'src/proforma/proforma.module'; // اضافه شده
import { InvoiceGoods } from './invoice-good.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceGoods]), ProformaModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
