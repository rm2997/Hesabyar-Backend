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
import { GoodsService } from './goods.service';
import { Good } from './good.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post()
  async create(@Body() data: Partial<Good>, @Req() req: Request) {
    const user = req.user as User;
    console.log(data);

    return this.goodsService.createGood(data, user.id);
  }

  @Get()
  async getAll() {
    const goods = await this.goodsService.getAllGoods();
    console.log(goods[0].goodUnit);

    return goods;
  }

  @Get(':id')
  async getGood(@Param('id') id: number) {
    const Good = await this.goodsService.getGoodById(id);
    console.log(Good?.goodUnit);

    return Good;
  }

  @Put(':id')
  async updateGood(@Param('id') id: number, @Body() data: Partial<Good>) {
    return await this.goodsService.updateGood(id, data);
  }

  @Delete(':id')
  async deleteGood(@Param('id') id: number) {
    return await this.goodsService.deleteGood(id);
  }
}
