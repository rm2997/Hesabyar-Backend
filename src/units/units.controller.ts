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
import { UserRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/decorators/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @UserRoles(Roles.Admin, Roles.Salesperson, Roles.Accountant)
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

  @UserRoles(Roles.Admin, Roles.Salesperson, Roles.Accountant)
  @Put(':id')
  async updateUnit(@Param('id') id: number, @Body() data: Partial<Unit>) {
    return await this.unitsService.updateUnit(id, data);
  }

  @UserRoles(Roles.Admin)
  @Delete(':id')
  async deleteUnit(@Param('id') id: number) {
    return await this.unitsService.deleteUnit(id);
  }
}
