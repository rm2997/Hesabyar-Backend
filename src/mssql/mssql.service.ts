import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MssqlService {
  constructor(
    @InjectDataSource() private readonly mysqlDataSource: DataSource,
    @InjectDataSource('mssqlConnection')
    private readonly mssqlDataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async getConnectionData() {
    return {
      ip: this.configService.get('SEPDB_HOST'),
      port: this.configService.get('SEPDB_PORT'),
      userName: this.configService.get('SEPDB_USERNAME'),
      databaseName: this.configService.get('SEPDB_DBNAME'),
      password: "Can't show password",
    };
  }

  async testConnection() {
    try {
      const data = await this.mssqlDataSource.query(
        'SELECT COUNT(*) from INV.Item',
      );
      if (data) return { result: 'connected' };
      else return { result: 'disconnected' };
    } catch (error) {
      Logger.error(error);
      return { result: error };
    }
  }

  async syncGoods() {
    const data = await this.mssqlDataSource.query(
      'SELECT Title as goodName ,0 as goodPrice,INV.item.Version as goodCount,Title_En as goodInfo,Code as sepidarID  from INV.Item',
    );
    const mysqlQueryRunner = this.mysqlDataSource.createQueryRunner();
    mysqlQueryRunner.startTransaction();
    try {
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlQueryRunner.query('DELETE FROM good;');
      await mysqlQueryRunner.query('ALTER TABLE good AUTO_INCREMENT = 1');
      for (const g of data) {
        await mysqlQueryRunner.query(
          'INSERT INTO good (goodName,goodPrice,goodCount,goodInfo,createdAt,sepidarId,goodUnitId) VALUES(?,?,?,?,?,?,?)',
          [
            g.goodName,
            g.goodPrice,
            g.goodCount,
            g.goodInfo,
            new Date(),
            g.sepidarId,
            1,
          ],
        );
      }
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await mysqlQueryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      Logger.error(error);
      return { result: error };
    }
  }

  async syncUnits() {
    const data = await this.mssqlDataSource.query(
      'SELECT unitId as sepidarID,Title as unitName ,Title_En as unitInfo from INV.Unit',
    );
    console.log(data);

    const mysqlQueryRunner = this.mysqlDataSource.createQueryRunner();
    mysqlQueryRunner.startTransaction();
    try {
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlQueryRunner.query('DELETE FROM unit;');
      await mysqlQueryRunner.query('ALTER TABLE unit AUTO_INCREMENT = 1');
      for (const g of data) {
        await mysqlQueryRunner.query(
          'INSERT INTO unit (unitName,unitInfo,createdAt,sepidarId) VALUES(?,?,?,?)',
          [g.unitName, g.unitInfo, new Date(), g.sepidarId, 1],
        );
      }
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await mysqlQueryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      Logger.error(error);
      return { result: error };
    }
  }
}
