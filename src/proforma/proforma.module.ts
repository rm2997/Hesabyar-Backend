import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProformaController } from './proforma.controller';
import { ProformaService } from './proforma.service';
import { Proforma } from './proforma.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ProformaGoods } from './proforma-goods.entity';
import { SmsModule } from 'src/sms/sms.module';

// ماژول پیش‌فاکتور برای پیوستن کنترلر، سرویس و انتیتی
@Module({
  imports: [
    TypeOrmModule.forFeature([Proforma, ProformaGoods]),
    AuthModule,
    SmsModule,
  ],
  controllers: [ProformaController],
  providers: [ProformaService],
  exports: [ProformaService],
})
export class ProformaModule {}
