import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'src/users/users.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DepotService } from './depot.service';
import { Depot } from './depot.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { DepotTypes } from 'src/common/decorators/depotTypes.enum';
import { existsSync } from 'fs';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post()
  async create(@Body() data: Partial<Depot>, @Req() req: Request) {
    console.log(data);

    const user = req.user as User;
    return this.depotService.createDepot(data, user.id);
  }

  @Get('image/:id')
  async getDepotImageFile(@Param('id') id: number, @Res() res: Response) {
    const depot = await this.depotService.getDepotById(id);
    if (!depot) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');
    if (!depot?.goodImage)
      throw new NotFoundException('برای این رکورد تصویری ثبت نشده است');

    const filePath = join(__dirname, '..', '..', depot.goodImage);

    if (!existsSync(filePath)) {
      throw new NotFoundException('فایل در سرور موجود نیست');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(filePath);
  }

  @Patch('image/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/depot',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            'depot_' + Date.now() + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateDepotImageFile(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('فایلی ارسال نشده است');
    }
    const depot = await this.depotService.getDepotById(id);
    if (!depot) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');

    const filePath = `/uploads/depot/${image.filename}`;
    depot.goodImage = filePath;

    return await this.depotService.updateDepot(depot?.id, depot);
  }

  @Get()
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type: DepotTypes,
    @Query('search') search: string,
  ) {
    if (type == DepotTypes.in)
      return await this.depotService.getAllInputDepots(page, limit, search);
    else return await this.depotService.getAllOutputDepots(page, limit, search);
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
