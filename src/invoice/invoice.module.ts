import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { ProformaModule } from 'src/proforma/proforma.module'; // اضافه شده

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    ProformaModule, // این خط خیلی مهمه
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
