import { Controller, Get, Post } from '@nestjs/common';
import { MssqlService } from './mssql.service';

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

  @Post('syncGoods')
  async syncGoods() {
    return await this.mssqlService.syncGoods();
  }

  @Post('syncUnits')
  async syncUnits() {
    return await this.mssqlService.syncUnits();
  }

  @Post('syncCustomers')
  async syncCustomers() {
    return await this.mssqlService.syncCustomers();
  }

  @Get('getFiscalYear')
  async getFiscalYear() {
    return await this.mssqlService.getFiscalYearAndId();
  }

  @Get('getAllStocks')
  async getAllStocks() {
    return await this.mssqlService.getAllStock();
  }
}
