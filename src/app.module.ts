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
import { CustomerService } from './customer/customer.service';
import { CustomerModule } from './customer/customer.module';
import { GoodsService } from './goods/goods.service';
import { GoodsController } from './goods/goods.controller';
import { GoodsModule } from './goods/goods.module';
import { AppService } from './app.service';
import { SalesService } from './sales/sales.service';
import { SalesController } from './sales/sales.controller';
import { SalesModule } from './sales/sales.module';
import { DepotModule } from './depot/depot.module';
import { UnitsModule } from './units/units.module';
import { SmsModule } from './sms/sms.module';
import { OtpService } from './otp/otp.service';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    // بارگذاری تنظیمات از .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // اتصال به دیتابیس MySQL با تنظیمات از .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        //synchronize: false,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: true,
        logger: 'advanced-console',
      }),
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
  ],

  // تعریف گاردها به صورت گلوبال برای کل پروژه
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: JwtAuthGuard, // گارد JWT برای احراز هویت
  //   },
  //   {
  //     provide: APP_GUARD,
  //     useClass: RolesGuard, // گارد نقش‌ها برای کنترل دسترسی
  //   },
  // ],
})
export class AppModule {}
