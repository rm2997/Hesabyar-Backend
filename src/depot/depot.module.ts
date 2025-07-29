import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depot } from './depot.entity';
import { DepotGoods } from './depot-goods.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Depot, DepotGoods, Invoice]), SmsModule],
  controllers: [DepotController],
  providers: [DepotService],
})
export class DepotModule {}
