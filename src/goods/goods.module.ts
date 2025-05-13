import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Good } from './good.entity';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { UnitsModule } from 'src/units/units.module';

@Module({
  imports: [TypeOrmModule.forFeature([Good]), UnitsModule],
  controllers: [GoodsController],
  providers: [GoodsService],
})
export class GoodsModule {}
