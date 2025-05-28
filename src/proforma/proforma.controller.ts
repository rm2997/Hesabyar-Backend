import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProformaService } from './proforma.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Proforma } from './proforma.entity';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { Public } from 'src/common/decorators/jwt.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proforma')
export class ProformaController {
  constructor(private readonly proformaService: ProformaService) {}

  @Post()
  async create(@Body() data: Partial<Proforma>, @Req() req: Request) {
    const user = req.user as User;
    return this.proformaService.createProforma(data, user);
  }

  @Get('token/:token')
  @Public()
  async getProformaByToken(@Param('token') token: string) {
    return this.proformaService.verifyAndFetchProforma(token);
  }

  @Post('generateNewToken/:id')
  async generateNewToken(@Param('id') id: number) {
    return this.proformaService.renewProformaToken(id);
  }

  @Get('share-link/:id')
  async getShareableLink(@Param('id') id: number) {
    return {
      link: await this.proformaService.generateShareableLink(id),
    };
  }

  @Put('convert/:id')
  async convert(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as User;
    return this.proformaService.convertToInvoice(id, user);
  }
  @Get('view/:token')
  @Public()
  async viewProforma(@Param('token') token: string) {
    return await this.proformaService.verifyAndFetchProforma(token);
  }

  @Get('user/my')
  async getByUserId(@Req() req: Request) {
    const user = req.user as User;
    return this.proformaService.getAllByUser(user);
  }

  @Get()
  async getAll() {
    return this.proformaService.getAll();
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const response = this.proformaService.getProforma(id);
    return response;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: Partial<Proforma>) {
    return this.proformaService.updateProforma(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.proformaService.deleteProforma(id);
  }
}
