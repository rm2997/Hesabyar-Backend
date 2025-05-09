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
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async create(@Body() data: Partial<Sale>, @Req() req: Request) {
    const user = req.user as User;
    return this.salesService.createSale(data, user.id);
  }

  @Get()
  async getAll() {
    return await this.salesService.getAllSales();
  }

  @Get(':id')
  async getSale(@Param('id') id: number) {
    const Sale = await this.salesService.getSaleById(id);
    console.log(Sale);

    return Sale;
  }

  @Put(':id')
  async updateSale(@Param('id') id: number, @Body() data: Partial<Sale>) {
    return await this.salesService.updateSale(id, data);
  }

  @Delete(':id')
  async deleteSale(@Param('id') id: number) {
    return await this.salesService.deleteSale(id);
  }
}
