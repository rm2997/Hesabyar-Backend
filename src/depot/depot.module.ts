import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depot } from './depot.entity';
import { DepotGoods } from './depot-goods.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { SmsModule } from 'src/sms/sms.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';
import { CustomerPhone } from 'src/customer/customer-phone.entity';
import { GoodsModule } from 'src/goods/goods.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Depot, DepotGoods, Invoice, CustomerPhone]),
    SmsModule,
    UsersModule,
    GoodsModule,
    NotificationModule,
  ],
  controllers: [DepotController],
  providers: [DepotService],
})
export class DepotModule {}
