import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Unit } from './unit.entity';
import { UnitsService } from './units.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  async create(@Body() data: Partial<Unit>, @Req() req: Request) {
    const user = req.user as User;
    return this.unitsService.createUnit(data, user.id);
  }

  @Get()
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') serach: string,
  ) {
    return await this.unitsService.getAllUnits(page, limit, serach);
  }

  @Get(':id')
  async getUnit(@Param('id') id: number) {
    const Unit = await this.unitsService.getUnitById(id);
    console.log(Unit);

    return Unit;
  }

  @Put(':id')
  async updateUnit(@Param('id') id: number, @Body() data: Partial<Unit>) {
    return await this.unitsService.updateUnit(id, data);
  }

  @Delete(':id')
  async deleteUnit(@Param('id') id: number) {
    return await this.unitsService.deleteUnit(id);
  }
}
