import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Notification } from 'src/notification/notification.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification]), SmsModule], // این خیلی مهمه!
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // در صورت نیاز به استفاده در AuthModule یا جای دیگه
})
export class UsersModule {}
