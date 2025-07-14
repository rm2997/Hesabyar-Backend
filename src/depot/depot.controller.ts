import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DepotService } from './depot.service';
import { Depot } from './depot.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post()
  async create(@Body() data: Partial<Depot>, @Req() req: Request) {
    const user = req.user as User;
    return this.depotService.createDepot(data, user.id);
  }

  @Get()
  async getAll() {
    return await this.depotService.getAllDepots();
  }

  @Get(':id')
  async getDepot(@Param('id') id: number) {
    const Depot = await this.depotService.getDepotById(id);
    return Depot;
  }

  @Put(':id')
  async updateDepot(@Param('id') id: number, @Body() data: Partial<Depot>) {
    return await this.depotService.updateDepot(id, data);
  }

  @Delete(':id')
  async deleteDepot(@Param('id') id: number) {
    return await this.depotService.deleteDepot(id);
  }
}
