import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SepidarQuotationDTO } from './sepidarQuotation-dto';
import { SepidarQuotationItemDTO } from './sepidarQuotaionItem-dto';
import { SepidarInvoiceDTO } from './sepidarInvoice-dto';
import { InvoiceItemDTO } from './sepidarInvoiceItem-dto';

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
          [g.unitName, g.unitInfo, new Date(), g.sepidarID],
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
      'SELECT partyid, Name as customerFName ,LastName as customerLName, EconomicCode as customerEconomicCode,IsCustomer,IsBroker,IsPurchasingAgent as isBuyerAgent From GNR.Party',
    );
    console.log(data);

    const mysqlQueryRunner = this.mysqlDataSource.createQueryRunner();
    await mysqlQueryRunner.connect();
    await mysqlQueryRunner.startTransaction();
    try {
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlQueryRunner.query('DELETE FROM customer;');
      await mysqlQueryRunner.query('ALTER TABLE customer AUTO_INCREMENT = 1');
      for (const g of data) {
        await mysqlQueryRunner.query(
          'INSERT INTO customer (customerFName,customerLName,customerEconomicCode,IsCustomer,IsBroker,isBuyerAgent,createdAt) VALUES(?,?,?,?,?,?,?)',
          [
            g.customerFName,
            g.customerLName,
            g.EconomicCode,
            g.IsCustomer,
            g.IsBroker,
            g.isBuyerAgent,
            new Date(),
          ],
        );
      }
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      await mysqlQueryRunner.commitTransaction();
      return { result: 'ok' };
    } catch (error) {
      mysqlQueryRunner.rollbackTransaction();
      Logger.error(error);
      return { result: 'not ok', error: 'اطلاعات مشتریان درج نشد' };
    } finally {
      await mysqlQueryRunner.release();
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

  async getFiscalYearAndId(): Promise<{
    FiscalYear: string;
    FiscalYearId: number;
  }> {
    const data = await this.mssqlDataSource.query(
      'SELECT TOP 1 title as FiscalYear,FiscalYearId from GNR.DimDate INNER JOIN FMK.FiscalYear on Jyear=Title  WHERE  miladi= LEFT(CAST(GETDATE() as date),10)',
    );

    return data[0];
  }

  async getNextId(resourceName: string): Promise<{ LastId: number }> {
    const data = await this.mssqlDataSource.query(
      `DECLARE @id int EXEC [FMK].[spGetNextId] '${resourceName}', @id output, 1 SELECT @Id as LastId`,
    );

    return data[0];
  }

  async getNextInvoiceNumber(
    fiscalYear: number,
    invoiceId: number,
  ): Promise<{ Number: number }> {
    await this.mssqlDataSource.query("Exec FMK.spGetLock 'InvoiceRow' ");
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'Select IsNull( Max(Number) + 1, 1)  as Number FROM SLS.[vwInvoice]  WHERE 1=1  And FiscalYearRef = (@FiscalYear0)',N'@FiscalYear0 as int,FiscalYear0=${fiscalYear}'`,
    );
    console.log(data);

    const checkExist = await this.mssqlDataSource.query(
      `Select Count(1) as exist from SLS.[vwInvoice] where [InvoiceId] <> ${invoiceId} And [Number] = ${data[0].Number} And [FiscalYearRef] = ${fiscalYear} `,
    );
    if (checkExist[0].exist > 0)
      throw new BadRequestException(
        'شماره تکراری در سیستم پیدا شد، دوباره سعی کنید',
      );

    return data[0];
  }

  async getItemByProformaId(proformaID: number): Promise<any> {
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'SELECT  [ItemSecondaryUnitRef], [ItemType], [CustomerDiscountRate], [PriceInfoDiscountRate], [TracingRef], [TaxExempt], [Description], [Description_En], [UnitTitle], [ItemBarCode], [ItemIranCode], [UnitTitle_En], [DiscountQuotationItemRef], [PriceInfoPriceDiscount], [PriceInfoPercentDiscount], [SerialTracking], [ProductPackRef], [ProductPackTitle], [ProductPackQuantity], [ItemSaleGroupRef], [ItemPurchaseGroupRef], [IsAggregateDiscountInvoiceItem], [QuotationItemID], [QuotationRef], [RowID], [ItemRef], [ItemCode], [ItemTitle], [ItemTitle_En], [ItemIsUnitRatioConstant], [ItemUnitsRatio], [ItemTracingCategoryRef], [StockRef], [TracingTitle], [StockCode], [StockTitle], [StockTitle_En], [Quantity], [SecondaryQuantity], [Fee], [Discount], [PriceInBaseCurrency], [DiscountInBaseCurrency], [AdditionInBaseCurrency], [TaxInBaseCurrency], [DutyInBaseCurrency], [NetPriceInBaseCurrency], [Addition], [Tax], [Duty], [Rate], [Price], [UsedQuantity], [AggregateAmountDiscountRate], [CalculationFormulaRef], [DeliveredQuantity], [CustomerDiscount], [PropertyAmounts], [AggregateAmountPriceDiscount], [AggregateAmountPercentDiscount], [AdditionFactor_VatEffective], [AdditionFactor_VatIneffective], [AdditionFactorInBaseCurrency_VatEffective], [AdditionFactorInBaseCurrency_VatIneffective] FROM SLS.[vwQuotationItem]   WHERE ([QuotationRef] = @QuotationRef0 ) ',N'@QuotationRef0 int',@QuotationRef0=${proformaID}`,
    );
    return data;
  }

  async getCustomerProformaId(proformaID: number): Promise<any> {
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'SELECT  [FiscalYearRef], [SaleTypeMarket], [CustomerIdentificationCode], [CustomerEconomicCode], [CustomerState], [CustomerCity], [CustomerVillage], [CustomerZipCode], [CustomerPhone], [QuotationId], [Number], [CustomerPartyRef], [Date], [CustomerPartyDLCode], [CustomerPartyName], [PartyAddressRef], [CustomerPartyName_En], [PartyAddress], [PartyAddress_En], [SaleTypeTitle], [SaleTypeRef], [SaleTypeTitle_En], [NetPrice], [ExpirationDate], [CurrencyRef], [CurrencyTitle], [CurrencyTitle_En], [Price], [Discount], [Addition], [Tax], [DiscountInBaseCurrency], [AdditionInBaseCurrency], [TaxInBaseCurrency], [DutyInBaseCurrency], [NetPriceInBaseCurrency], [Duty], [PriceInBaseCurrency], [SaleTypeNumber], [Rate], [CustomerFax], [DeliveryLocationRef], [Version], [CustomerEMail], [DeliveryLocationTitle], [Creator], [CustomerPartyDLRef], [DeliveryLocationTitle_En], [CreationDate], [CustomerCity_En], [LastModifier], [CustomerState_En], [LastModificationDate], [BillRemainder], [Closed], [VendorRemainder], [DiscountOnCustomer], [CustomerRemainder], [CurrencyPrecisionCount], [CustomerGroupingRef], [CustomerGroupingTitle], [ReceiptRef], [PaymentRef], [RemainedDaysToExpiration], [CreatorName], [CustomerRealName], [CustomerRealName_En], [Guid], [AdditionFactor_VatEffective], [AdditionFactorInBaseCurrency_VatEffective], [AdditionFactor_VatIneffective], [AdditionFactorInBaseCurrency_VatIneffective] FROM SLS.[vwQuotation]   WHERE ([QuotationId] = @QuotationId0 ) ',N'@QuotationId0 int',@QuotationId0=${proformaID}`,
    );
    return data;
  }

  async createInvoice(
    quotation: SepidarQuotationDTO,
    quotationItems: SepidarQuotationItemDTO[],
    invoice: SepidarInvoiceDTO,
    invoiceItems: InvoiceItemDTO[],
  ) {
    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1️⃣ بررسی سال مالی معتبر
      const fiscalYear = await queryRunner.manager.query(
        `SELECT FiscalYearID FROM FIN.FiscalYear WHERE FiscalYearID=@0`,
        [quotation.FiscalYearRef],
      );
      if (!fiscalYear.length) throw new Error('سال مالی معتبر نیست');

      // 2️⃣ فچ آخرین شماره فاکتور
      const lastInvoiceNumber = await queryRunner.manager.query(
        `SELECT MAX(Number) AS LastNumber FROM SLS.Invoice`,
      );
      invoice.Number = (lastInvoiceNumber[0].LastNumber || 0) + 1;

      // 3️⃣ بررسی موجودی و قفل کردن StockSummary
      for (const item of invoiceItems) {
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable;
           INSERT INTO @SummaryTable VALUES(@0, @1, NULL, @2, 0);
           EXEC INV.spLockItemStockSummary @SummaryTable;`,
          [item.StockRef, item.ItemRef, invoice.FiscalYearRef],
        );
      }

      // 4️⃣ درج Quotation و QuotationItem
      await queryRunner.manager.insert('SLS.Quotation', quotation);
      for (const qItem of quotationItems) {
        await queryRunner.manager.insert('SLS.QuotationItem', qItem);
      }

      // 5️⃣ درج Invoice و InvoiceItem
      await queryRunner.manager.insert('SLS.Invoice', invoice);
      for (const iItem of invoiceItems) {
        await queryRunner.manager.insert('SLS.InvoiceItem', iItem);
      }

      // 6️⃣ آپدیت Stock Summary
      for (const item of invoiceItems) {
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable;
           INSERT INTO @SummaryTable VALUES(@0, @1, NULL, @2, 0);
           EXEC INV.spUpdateItemStockSummary @SummaryTable, 0;`,
          [item.StockRef, item.ItemRef, invoice.FiscalYearRef],
        );
      }
      await queryRunner.commitTransaction();

      return { invoiceNumber: invoice.Number };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }
}
