import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depot } from './depot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Depot])],
  controllers: [DepotController],
  providers: [DepotService],
})
export class DepotModule {}
