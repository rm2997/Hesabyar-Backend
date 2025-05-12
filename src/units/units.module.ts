import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  providers: [UnitsService],
  controllers: [UnitsController],
})
export class UnitsModule {}
