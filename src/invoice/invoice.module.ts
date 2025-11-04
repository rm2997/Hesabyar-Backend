import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { ProformaModule } from 'src/proforma/proforma.module'; // اضافه شده
import { InvoiceGoods } from './invoice-good.entity';
import { SmsModule } from 'src/sms/sms.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from 'src/users/users.module';
import { CustomerPhone } from 'src/customer/customer-phone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceGoods, CustomerPhone]),
    ProformaModule,
    SmsModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
