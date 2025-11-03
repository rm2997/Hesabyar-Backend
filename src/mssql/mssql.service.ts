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
      'SELECT Title as goodName,UnitRef ,0 as goodPrice,INV.item.Version as goodCount,Title_En as goodInfo,Code as sepidarID  from INV.Item',
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
            g.sepidarID,
            g.UnitRef,
          ],
        );
      }
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await mysqlQueryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      mysqlQueryRunner.rollbackTransaction();
      Logger.error(error);
      return { result: 'not ok', error: 'اطلاعات کالاها درج نشد' };
    }
  }

  async syncUnits() {
    const data = await this.mssqlDataSource.query(
      'SELECT unitId as sepidarID,Title as unitName ,Title_En as unitInfo from INV.Unit',
    );

    const mysqlQueryRunner = this.mysqlDataSource.createQueryRunner();
    mysqlQueryRunner.startTransaction();
    try {
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlQueryRunner.query('DELETE FROM unit;');
      await mysqlQueryRunner.query('ALTER TABLE unit AUTO_INCREMENT = 1');
      for (const g of data) {
        await mysqlQueryRunner.query(
          'INSERT INTO unit (unitName,unitInfo,createdAt,sepidarId) VALUES(?,?,?,?)',
          [g.unitName, g.unitInfo, new Date(), g.sepidarID, 1],
        );
      }
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await mysqlQueryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      mysqlQueryRunner.rollbackTransaction();
      Logger.error(error);
      return { result: 'not ok', error: 'اطلاعات واحدها درج نشد' };
    }
  }

  async syncCustomers() {
    const data = await this.mssqlDataSource.query(
      'SELECT Name as customerFName ,LastName as customerLName,Phone as customerMobile From GNR.Party LEFT OUTER JOIN GNR.PartyPhone ON Party.PartyId=PartyPhone.PartyRef ',
    );
    console.log(data);

    const mysqlQueryRunner = this.mysqlDataSource.createQueryRunner();
    mysqlQueryRunner.startTransaction();
    try {
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlQueryRunner.query('DELETE FROM customer;');
      await mysqlQueryRunner.query('ALTER TABLE customer AUTO_INCREMENT = 1');
      for (const g of data) {
        await mysqlQueryRunner.query(
          'INSERT INTO customer (customerFName,customerLName,customerMobile,createdAt) VALUES(?,?,?,?)',
          [g.customerFName, g.customerLName, g.customerMobile, new Date()],
        );
      }
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await mysqlQueryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      mysqlQueryRunner.rollbackTransaction();
      Logger.error(error);
      return { result: 'not ok', error: 'اطلاعات مشتریان درج نشد' };
    }
  }

  async addNewUnit(unitName: string) {
    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const lastIdResult = await queryRunner.query(
        'SELECT LastId FROM FMK.IDGeneration WHERE TableName = @0',
        ['INV.Unit'],
      );
      const id = lastIdResult[0]?.LastId ?? 0;
      const newId = id + 1;
      await queryRunner.query(
        `INSERT INTO inv.Unit 
       (UnitID, Title, Title_En, Version, Creator, CreationDate, LastModifier, LastModificationDate)
       VALUES 
       (@0, @1, @2, @3, @4, @5, @6, @7)`,
        [newId, unitName, unitName, 1, 1, new Date(), 1, new Date()],
      );
      await queryRunner.query(
        `UPDATE FMK.IDGeneration 
       SET LastId = @0 
       WHERE TableName = @1`,
        [newId, 'INV.Unit'],
      );

      await queryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error(error);
      return { result: 'not ok', error: 'ثبت واحد انجام نشد' };
    } finally {
      await queryRunner.release();
    }
  }

  async addNewItem(unitName: string) {
    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const lastIdResult = await queryRunner.query(
        'SELECT LastId FROM FMK.IDGeneration WHERE TableName = @0',
        ['INV.Item'],
      );
      const id = lastIdResult[0]?.LastId ?? 0;
      const newId = id + 1;
      await queryRunner.query(
        `INSERT INTO INV.Item 
      (ItemID
           ,Type
           ,Code
           ,Title
           ,Title_En
           ,BarCode
           ,UnitRef
           ,SecondaryUnitRef
           ,IsUnitRatioConstant
           ,UnitsRatio
           ,MinimumAmount
           ,MaximumAmount
           ,CanHaveTracing
           ,TracingCategoryRef
           ,IsPricingBasedOnTracing
           ,TaxExempt
           ,TaxExemptPurchase
           ,Sellable
           ,DefaultStockRef
           ,PurchaseGroupRef
           ,SaleGroupRef
           ,CompoundBarcodeRef
           ,ItemCategoryRef
           ,Creator
           ,CreationDate
           ,LastModifier
           ,LastModificationDate
           ,Version
           ,IsActive
           ,AccountSLRef
           ,TaxRate
           ,DutyRate
           ,CodingGroupRef
           ,SerialTracking
           ,Weight
           ,Volume
           ,IranCode)
       VALUES 
       (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24, @25, @26, @27, @28, @29, @30, @31, @32, @33, @34, @35, @36)`,
        [newId, unitName, unitName, 1, 1, new Date(), 1, new Date()],
      );
      await queryRunner.query(
        `UPDATE FMK.IDGeneration 
       SET LastId = @0 
       WHERE TableName = @1`,
        [newId, 'INV.Unit'],
      );

      await queryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error(error);
      return { result: 'not ok', error: 'ثبت واحد انجام نشد' };
    } finally {
      await queryRunner.release();
    }
  }
}
