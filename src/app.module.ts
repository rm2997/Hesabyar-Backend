import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// ماژول‌های داخلی پروژه
import { ProformaModule } from './proforma/proforma.module';
import { InvoiceModule } from './invoice/invoice.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';

// گاردها برای امنیت سیستم
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

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
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: true,
        logger: 'advanced-console',
      }),
    }),

    // ماژول‌های اصلی برنامه
    ProformaModule,
    InvoiceModule,
    UploadModule,
    AuthModule,
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
