import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MssqlService } from './mssql.service';
import { UserRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/decorators/roles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Request } from 'express';
import { User } from 'src/users/users.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sepidar')
export class MssqlController {
  constructor(private readonly mssqlService: MssqlService) {}

  @Get('test')
  async testSepidar() {
    return await this.mssqlService.testConnection();
  }

  @Get('connectionData')
  async getConnectionData() {
    return await this.mssqlService.getConnectionData();
  }

  @UserRoles(Roles.Admin)
  @Post('syncGoods')
  async syncGoods(@Req() req: Request) {
    const user = req.user as User;
    return await this.mssqlService.syncGoods(user);
  }

  @UserRoles(Roles.Admin)
  @Post('syncUnits')
  async syncUnits(@Req() req: Request) {
    const user = req.user as User;
    return await this.mssqlService.syncUnits(user);
  }

  @UserRoles(Roles.Admin)
  @Post('syncCustomers')
  async syncCustomers(@Req() req: Request) {
    const user = req.user as User;
    const result = await this.mssqlService.syncCustomers(user);
    if ((result.result = 'ok'))
      return await this.mssqlService.syncCustomerPhones(user);
    else
      throw new BadRequestException(
        'مشکلی در انتقال از سپیدار مشتریان پیش آمده است',
      );
  }

  @Get('getFiscalYear/:fiscalYearId')
  async getFiscalYear(@Param('fiscalYearId') fiscalYearId: number) {
    return await this.mssqlService.getFiscalYearAndId(fiscalYearId);
  }

  @Get('getAllStocks')
  async getAllStocks() {
    return await this.mssqlService.getAllStock();
  }

  @Get('getSepidarUsers')
  async getSepidarUsers() {
    return await this.mssqlService.getSepidarUsers();
  }
}
