import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Good } from './good.entity';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { UnitsModule } from 'src/units/units.module';
import { MssqlModule } from 'src/mssql/mssql.module';

@Module({
  imports: [TypeOrmModule.forFeature([Good]), UnitsModule, MssqlModule],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}
