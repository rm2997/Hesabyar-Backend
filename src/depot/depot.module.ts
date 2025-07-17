import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depot } from './depot.entity';
import { DepotGoods } from './depot-goods.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Depot, DepotGoods])],
  controllers: [DepotController],
  providers: [DepotService],
})
export class DepotModule {}
