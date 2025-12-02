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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GoodsService } from './goods.service';
import { Good } from './good.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';

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
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
  ) {
    const goods = await this.goodsService.getAllGoods(page, limit, search);
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

  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('excelFile'))
  async uploadExcel(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user as User;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    return await this.goodsService.createGoodFromExcelFile(data, user);
  }
}
