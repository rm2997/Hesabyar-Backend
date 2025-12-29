import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MssqlService } from './mssql.service';
import { UserRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/decorators/roles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

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
  async syncGoods() {
    return await this.mssqlService.syncGoods();
  }

  @UserRoles(Roles.Admin)
  @Post('syncUnits')
  async syncUnits() {
    return await this.mssqlService.syncUnits();
  }

  @UserRoles(Roles.Admin)
  @Post('syncCustomers')
  async syncCustomers() {
    return await this.mssqlService.syncCustomers();
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
