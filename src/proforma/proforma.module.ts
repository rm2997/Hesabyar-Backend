import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProformaController } from './proforma.controller';
import { ProformaService } from './proforma.service';
import { Proforma } from './proforma.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ProformaGoods } from './proforma-goods.entity';
import { SmsModule } from 'src/sms/sms.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from 'src/users/users.module';
import { CustomerPhone } from 'src/customer/customer-phone.entity';
import { MssqlModule } from 'src/mssql/mssql.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proforma, ProformaGoods, CustomerPhone]),
    AuthModule,
    SmsModule,
    NotificationModule,
    UsersModule,
    MssqlModule,
  ],
  controllers: [ProformaController],
  providers: [ProformaService],
  exports: [ProformaService],
})
export class ProformaModule {}
