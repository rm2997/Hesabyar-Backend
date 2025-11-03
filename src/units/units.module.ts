import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './unit.entity';
import { MssqlModule } from 'src/mssql/mssql.module';

@Module({
  imports: [TypeOrmModule.forFeature([Unit]), MssqlModule],
  providers: [UnitsService],
  controllers: [UnitsController],
  exports: [UnitsService],
})
export class UnitsModule {}
