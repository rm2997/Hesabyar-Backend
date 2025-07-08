import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
//import { HttpModule } from '@nestjs/axios';

@Module({
  // imports: [
  //   HttpModule.register({
  //     timeout: 5000,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
  //     },
  //   }),
  // ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
