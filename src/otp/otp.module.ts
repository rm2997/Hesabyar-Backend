import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SmsModule } from 'src/sms/sms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './otp.entity';

@Module({
  imports: [SmsModule, TypeOrmModule.forFeature([Otp])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
