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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'src/users/users.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DepotService } from './depot.service';
import { Depot } from './depot.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { DepotTypes } from 'src/common/decorators/depotTypes.enum';
import { existsSync } from 'fs';
import { DepotGoods } from './depot-goods.entity';
import { UserRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/decorators/roles.enum';
import { Public } from 'src/common/decorators/jwt.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post()
  async create(@Body() data: Partial<Depot>, @Req() req: Request) {
    const user = req.user as User;
    return this.depotService.createDepot(data, user);
  }

  // @Post()
  // @UseInterceptors(
  //   FilesInterceptor('images', 5, {
  //     storage: diskStorage({
  //       destination: './uploads/depot',
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix =
  //           'depot_' + Date.now() + Math.round(Math.random() * 1e9);
  //         cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  // async createDepotGood(
  //   @Body() data: Partial<Depot>,
  //   @Req() req: Request,
  //   @UploadedFiles() images: Express.Multer.File[],
  // ) {
  //   if (!images || images.length !== data.depotGoods?.length) {
  //     throw new BadRequestException('همه کالاها باید حاوی تصویر باشند');
  //   }
  //   const user = req.user as User;
  //   // ذخیره اولیه کالا
  //   const newDepotGood = await this.depotService.createDepot(data, user);

  //   // ساخت مسیر عکس‌ها و ذخیره‌سازی
  //   const imagePaths = images.map((img) => `/uploads/depot/${img.filename}`);

  //   newDepotGood.depotGoods.forEach(async (element, index) => {
  //     newDepotGood.depotGoods[index].image = imagePaths[index];
  //     await this.depotService.updateDepot(
  //       element.id,
  //       newDepotGood.depotGoods[index],
  //     );
  //   });

  //   return newDepotGood;
  // }

  @Get('image/:id')
  async getDepotImageFile(@Param('id') id: number, @Res() res: Response) {
    const depotGood = await this.depotService.getDepotGoodById(id);
    if (!depotGood) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');

    if (!depotGood.image)
      throw new NotFoundException('برای این رکورد تصویری ثبت نشده است');

    const filePath = join(__dirname, '..', '..', depotGood.image);

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
    const depotGood = await this.depotService.getDepotGoodById(id);
    if (!depotGood) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');

    const filePath = `/uploads/depot/${image.filename}`;
    depotGood.image = filePath;

    return await this.depotService.updateDepotGood(depotGood?.id, depotGood);
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

  @Get('accept-request')
  async getDepotsForAccept(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type: DepotTypes,
    @Query('search') search: string,
  ) {
    if (type == DepotTypes.in)
      return await this.depotService.getAllInputDepotsForAccept(
        page,
        limit,
        search,
      );
    else
      return await this.depotService.getAllOutputDepotsForAccept(
        page,
        limit,
        search,
      );
  }

  @Get(':id')
  async getDepot(@Param('id') id: number) {
    const Depot = await this.depotService.getDepotById(id);
    return Depot;
  }

  @Post('generateNewToken/:id')
  async generateNewToken(@Param('id') id: number) {
    const token = await this.depotService.generateNewToken(id);
    const data: Partial<Depot> = { customerToken: token, isSent: false };
    return await this.depotService.updateDepot(id, data);
  }

  @Get('token/:token')
  @Public()
  async getDepotByToken(@Param('token') token: string) {
    return await this.depotService.verifyAndFetchDepot(token);
  }

  @Patch('token/:token')
  @Public()
  async updateDepotByToken(
    @Param('token') token: string,
    @Body() data: Partial<Depot>,
  ) {
    const depot = await this.depotService.verifyAndFetchDepot(token);
    if (!depot) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');
    console.log('data is:', data);

    // if (depot.customerLink == token && depot.approvedFile) {
    //   throw new BadRequestException('این فاکتور قبلا تایید شده است');
    // }

    return this.depotService.updateDepot(depot?.id, data);
  }

  @Patch('sent/:id')
  async setDepotIsSent(@Param('id') id: number) {
    return await this.depotService.setDepotIsSent(id);
  }

  @Put(':id')
  async updateDepot(
    @Param('id') id: number,
    @Req() req: Request,
    @Body() data: Partial<Depot>,
  ) {
    const user = req.user as User;
    return await this.depotService.updateDepot(id, data);
  }

  @Delete(':id')
  async deleteDepot(@Param('id') id: number) {
    return await this.depotService.deleteDepot(id);
  }

  @UserRoles(Roles.Admin)
  @Patch('accept/:id')
  async setDepotIsAccepted(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as User;
    const depot: Depot = await this.depotService.setDepotIsAccepted(id, user);

    return depot;
  }
}
