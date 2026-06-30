import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// ماژول‌های داخلی پروژه
import { ProformaModule } from './proforma/proforma.module';
import { InvoiceModule } from './invoice/invoice.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';

// گاردها برای امنیت سیستم
import { NotificationModule } from './notification/notification.module';
import { CustomerModule } from './customer/customer.module';
import { GoodsModule } from './goods/goods.module';
import { SalesModule } from './sales/sales.module';
import { DepotModule } from './depot/depot.module';
import { UnitsModule } from './units/units.module';
import { SmsModule } from './sms/sms.module';
import { OtpModule } from './otp/otp.module';
import { MssqlModule } from './mssql/mssql.module';
import { ConfigurationModule } from './config/configuration.module';
import { ConfigurationService } from './config/configuration.service';

@Module({
  imports: [
    // .env file loading
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev','.env'],
    }),

    // connect to local mysql db
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) =>
        configService.mySqlAsansorlandDataBase(),
    }),
    ProformaModule,
    InvoiceModule,
    UploadModule,
    AuthModule,
    NotificationModule,
    CustomerModule,
    GoodsModule,
    SalesModule,
    DepotModule,
    UnitsModule,
    SmsModule,
    OtpModule,
    MssqlModule,
  ],  
})
export class AppModule {}
