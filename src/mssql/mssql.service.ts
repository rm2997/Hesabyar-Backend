import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { SepidarQuotationDTO } from './sepidarQuotation-dto';
import { SepidarQuotationItemDTO } from './sepidarQuotaionItem-dto';
import { SepidarInvoiceDTO } from './sepidarInvoice-dto';
import { SepidarInvoiceItemDTO } from './sepidarInvoiceItem-dto';
import { SepidarVoucherDTO } from './sepidarVoucher-dto';
import { SepidarVoucherItemDTO } from './sepidarVoucherItem-dto';
import { Invoice } from 'src/invoice/invoice.entity';
import { InvoiceGoods } from 'src/invoice/invoice-good.entity';
import { Proforma } from 'src/proforma/proforma.entity';
import { ProformaGoods } from 'src/proforma/proforma-goods.entity';

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
      'SELECT ItemID as sepidarId, Title as goodName,UnitRef ,0 as goodPrice,INV.item.Version as goodCount,Title_En as goodInfo,Code as sepidarCode  from INV.Item',
    );
    const mysqlQueryRunner = this.mysqlDataSource.createQueryRunner();
    mysqlQueryRunner.startTransaction();
    try {
      await mysqlQueryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlQueryRunner.query('DELETE FROM good;');
      await mysqlQueryRunner.query('ALTER TABLE good AUTO_INCREMENT = 1');
      for (const g of data) {
        await mysqlQueryRunner.query(
          'INSERT INTO good (goodName,goodPrice,goodCount,goodInfo,createdAt,sepidarId,sepidarCode,goodUnitId) VALUES(?,?,?,?,?,?,?,?)',
          [
            g.goodName,
            g.goodPrice,
            g.goodCount,
            g.goodInfo,
            new Date(),
            g.sepidarId,
            g.sepidarCode,
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
          'INSERT INTO customer (customerFName,customerLName,customerEconomicCode,IsCustomer,IsBroker,isBuyerAgent,createdAt,sepidarId) VALUES(?,?,?,?,?,?,?,?)',
          [
            g.customerFName,
            g.customerLName,
            g.EconomicCode,
            g.IsCustomer,
            g.IsBroker,
            g.isBuyerAgent,
            new Date(),
            g.partyid,
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

  async getCustomerById(customerId: number) {
    const data = await this.mssqlDataSource.query(
      'SELECT * FROM GNR.vwParty WHERE PartyId=@0',
      [customerId],
    );
    return data[0];
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

  async getFiscalYearAndId(fiscalYearRef: number = 0): Promise<{
    FiscalYear: string;
    FiscalYearId: number;
  }> {
    if (fiscalYearRef == 0) {
      const data = await this.mssqlDataSource.query(
        `SELECT TOP 1 title as FiscalYear,FiscalYearId 
        from GNR.DimDate INNER JOIN FMK.FiscalYear on Jyear=Title  
        WHERE  miladi= LEFT(CAST(GETDATE() as date),10)`,
      );
      console.log('Fiscal Year is: ' + data[0].FiscalYear);
      return data[0];
    } else {
      const data = await this.mssqlDataSource.query(
        `SELECT TOP 1 title as FiscalYear,FiscalYearId 
      from GNR.DimDate INNER JOIN FMK.FiscalYear on Jyear=Title  
      WHERE  FiscalYearId=@0`,
        [fiscalYearRef],
      );
      if (data == null || data.length == 0) {
        console.log('Could not fetch Fiscal year...');
        throw new BadRequestException(
          'خطا در دریافت سال مالی از بانک اطلاعاتی سپیدار',
        );
      }
      console.log('Fiscal Year is: ' + data[0].FiscalYear);

      return data[0];
    }
  }

  async getAllStock() {
    const data = await this.mssqlDataSource.query(
      'SELECT * FROM [INV].[Stock]',
    );
    console.log(data);

    return data;
  }

  async getSepidarUsers() {
    const data = await this.mssqlDataSource.query(
      '  SELECT * FROM [FMK].[User] WHERE IsDeleted=0 AND Status=1',
    );
    return data;
  }

  async getAllExistItems(): Promise<any[]> {
    const { FiscalYearId } = await this.getFiscalYearAndId();
    const data = await this.mssqlDataSource.query(
      `SELECT * FROM INV.vwItemStockSummary WHERE FiscalYearRef=@0`,
      [FiscalYearId],
    );
    return data;
  }

  async getItemById(itemRef: number) {
    const { FiscalYearId } = await this.getFiscalYearAndId();
    const data = await this.mssqlDataSource.query(
      `SELECT * FROM INV.vwItemStockSummary WHERE FiscalYearRef=@0 AND itemRef=@1`,
      [FiscalYearId, itemRef],
    );
    if (!data || data?.length == 0) return [];
    console.log(data);
    return data;
  }

  async getNextId(resourceName: string): Promise<{ LastId: number }> {
    try {
      const data = await this.mssqlDataSource.query(
        `DECLARE @id int EXEC [FMK].[spGetNextId] '${resourceName}', @id output, 1 SELECT @Id as LastId`,
      );
      console.log(resourceName, data);

      console.log('Last Quotation Id is: ' + data[0].LastId);

      return data[0];
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
    }
  }

  async getNextInvoiceNumber(
    fiscalYearId: number,
    invoiceId: number,
  ): Promise<{ Number: number }> {
    try {
      await this.mssqlDataSource.query("Exec FMK.spGetLock 'InvoiceRow' ");
      const data = await this.mssqlDataSource.query(
        `Select IsNull( Max(Number) + 1, 1)  as Number FROM SLS.[vwInvoice]  WHERE 1=1  And FiscalYearRef =${fiscalYearId}`,
      );
      console.log(data);
      const checkExist = await this.mssqlDataSource.query(
        `Select Count(1) as exist from SLS.[vwInvoice] 
        where [InvoiceId] <> ${invoiceId} And [Number] = ${data[0].Number} And [FiscalYearRef] = ${fiscalYearId} `,
      );

      if (checkExist[0].exist > 0)
        throw new Error('شماره تکراری در سیستم پیدا شد، دوباره سعی کنید');
      return data[0];
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
    }
  }

  async getNextQuotationNumber(
    fiscalYearId: number,
    quotationId: number,
  ): Promise<{ Number: number }> {
    try {
      await this.mssqlDataSource.query("Exec FMK.spGetLock 'QuotationRow' ");
      const data = await this.mssqlDataSource.query(
        `Select IsNull( Max(Number) + 1, 1) as Number FROM SLS.[vwQuotation] 
        WHERE 1=1 And FiscalYearRef =@0`,
        [fiscalYearId],
      );
      const checkExist = await this.mssqlDataSource.query(
        `Select Count(1) as exist from SLS.[vwQuotation] 
        where [QuotationId] <>@0 And [Number] =@1 And [FiscalYearRef] =@2`,
        [quotationId, data[0].Number, fiscalYearId],
      );
      if (checkExist[0].exist > 0)
        throw new Error('شماره تکراری در سیستم پیدا شد، دوباره سعی کنید');
      console.log('Next Quotaion Number is:' + data[0]);

      return data[0];
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
    }
  }

  async getNextVoucherNumber(
    fiscalYearId: number,
    voucherId: number,
  ): Promise<{ Number: number }> {
    try {
      await this.mssqlDataSource.query("Exec FMK.spGetLock 'VoucherRow'");
      const data = await this.mssqlDataSource.query(
        `Select IsNull( Max(Number) + 1, 1)  as Number FROM ACC.[vwVoucher]  
        WHERE 1=1  And FiscalYearRef =${fiscalYearId}`,
      );

      console.log(data);
      const checkExist = await this.mssqlDataSource.query(
        `Select Count(1) as exist from ACC.[vwVoucher] 
        where [VoucherId] <> ${voucherId} And [Number] = ${data[0].Number} And [FiscalYearRef] = ${fiscalYearId} `,
      );

      if (checkExist[0].exist > 0)
        throw new BadRequestException(
          'شماره تکراری در سیستم پیدا شد، دوباره سعی کنید',
        );

      return data[0];
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
    }
  }

  async getNextVoucherDailyNumber(queryRunner: QueryRunner) {
    try {
      const data = await queryRunner.query(
        `SELECT ISNULL(MAX(DailyNumber), 0) + 1 NextDailyNumber FROM ACC.Voucher  
        WHERE LEFT(CONVERT(nvarchar(19),Date,120),10)=LEFT(CONVERT(nvarchar(19),GETDATE(),120),10)`,
      );
      return data[0];
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
    }
  }

  async getItemByProformaId(proformaID: number): Promise<any> {
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'SELECT  [ItemSecondaryUnitRef], [ItemType], [CustomerDiscountRate], [PriceInfoDiscountRate], [TracingRef], [TaxExempt], [Description], 
      [Description_En], [UnitTitle], [ItemBarCode], [ItemIranCode], [UnitTitle_En], [DiscountQuotationItemRef], [PriceInfoPriceDiscount], [PriceInfoPercentDiscount], 
      [SerialTracking], [ProductPackRef], [ProductPackTitle], [ProductPackQuantity], [ItemSaleGroupRef], [ItemPurchaseGroupRef], [IsAggregateDiscountInvoiceItem], 
      [QuotationItemID], [QuotationRef], [RowID], [ItemRef], [ItemCode], [ItemTitle], [ItemTitle_En], [ItemIsUnitRatioConstant], [ItemUnitsRatio], [ItemTracingCategoryRef],
      [StockRef], [TracingTitle], [StockCode], [StockTitle], [StockTitle_En], [Quantity], [SecondaryQuantity], [Fee], [Discount], [PriceInBaseCurrency], 
      [DiscountInBaseCurrency], [AdditionInBaseCurrency], [TaxInBaseCurrency], [DutyInBaseCurrency], [NetPriceInBaseCurrency], [Addition], [Tax], [Duty], [Rate], [Price],
      [UsedQuantity], [AggregateAmountDiscountRate], [CalculationFormulaRef], [DeliveredQuantity], [CustomerDiscount], [PropertyAmounts], [AggregateAmountPriceDiscount], 
      [AggregateAmountPercentDiscount], [AdditionFactor_VatEffective], [AdditionFactor_VatIneffective], [AdditionFactorInBaseCurrency_VatEffective], 
      [AdditionFactorInBaseCurrency_VatIneffective] FROM SLS.[vwQuotationItem]
      WHERE ([QuotationRef] = @QuotationRef0 )',N'@QuotationRef0 int',@QuotationRef0=${proformaID}`,
    );
    return data;
  }

  async getCustomerProformaId(proformaID: number): Promise<any> {
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'SELECT  [FiscalYearRef], [SaleTypeMarket], [CustomerIdentificationCode], [CustomerEconomicCode], [CustomerState], [CustomerCity], 
      [CustomerVillage], [CustomerZipCode], [CustomerPhone], [QuotationId], [Number], [CustomerPartyRef], [Date], [CustomerPartyDLCode], [CustomerPartyName], 
      [PartyAddressRef], [CustomerPartyName_En], [PartyAddress], [PartyAddress_En], [SaleTypeTitle], [SaleTypeRef], [SaleTypeTitle_En], [NetPrice], [ExpirationDate], 
      [CurrencyRef], [CurrencyTitle], [CurrencyTitle_En], [Price], [Discount], [Addition], [Tax], [DiscountInBaseCurrency], [AdditionInBaseCurrency], [TaxInBaseCurrency], 
      [DutyInBaseCurrency], [NetPriceInBaseCurrency], [Duty], [PriceInBaseCurrency], [SaleTypeNumber], [Rate], [CustomerFax], [DeliveryLocationRef], [Version], 
      [CustomerEMail], [DeliveryLocationTitle], [Creator], [CustomerPartyDLRef], [DeliveryLocationTitle_En], [CreationDate], [CustomerCity_En], [LastModifier], 
      [CustomerState_En], [LastModificationDate], [BillRemainder], [Closed], [VendorRemainder], [DiscountOnCustomer], [CustomerRemainder], [CurrencyPrecisionCount],
      [CustomerGroupingRef], [CustomerGroupingTitle], [ReceiptRef], [PaymentRef], [RemainedDaysToExpiration], [CreatorName], [CustomerRealName], [CustomerRealName_En],
      [Guid], [AdditionFactor_VatEffective], [AdditionFactorInBaseCurrency_VatEffective], [AdditionFactor_VatIneffective], [AdditionFactorInBaseCurrency_VatIneffective] 
      FROM SLS.[vwQuotation]   
      WHERE ([QuotationId] = @QuotationId0 ) ',N'@QuotationId0 int',@QuotationId0=${proformaID}`,
    );
    return data;
  }

  async createQuotation(proforma: Proforma, proformaGoods: ProformaGoods[]) {
    const { FiscalYearId } = await this.getFiscalYearAndId();
    if (!FiscalYearId) throw new BadRequestException('سال مالی معتبر نیست');
    const sepidarQuotation = await this.initiatNewSepidarQuotation(
      proforma,
      FiscalYearId,
    );
    console.log(sepidarQuotation);

    const sepidarQuotationItems: SepidarQuotationItemDTO[] = [];
    let i = 1;
    for (const proformaItem of proformaGoods) {
      const sepidarNewItem = await this.initiatNewSepidarQuotationItems(
        i,
        proformaItem.quantity,
        proformaItem.total,
        proformaItem?.good?.sepidarId,
        proformaItem?.price,
        sepidarQuotation.QuotationId,
        proforma.stockRef,
      );
      sepidarQuotationItems.push(sepidarNewItem);
      i++;
    }

    console.log('Start inserting Quotation to Sql Server...');

    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('Start Inserting Quotation...');

      await queryRunner.manager.insert('SLS.Quotation', sepidarQuotation);
      console.log('Start Inserting QuotationItems...');
      for (const item of sepidarQuotationItems) {
        await queryRunner.manager.insert('SLS.QuotationItem', item);
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${item.StockRef}, ${item.ItemRef}, NULL, ${FiscalYearId}, 0 )  Exec [INV].[spLockItemStockSummary] @SummaryTable`,
        );
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${item.StockRef}, ${item.ItemRef}, NULL, ${FiscalYearId}, 0 )  Exec [INV].[spUpdateItemStockSummary] @SummaryTable , 0`,
        );
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${item.StockRef}, ${item.ItemRef}, NULL, ${FiscalYearId}, 0)
         Select fn.*  FROM @SummaryTable T   CROSS APPLY  ( Select ItemStockSummaryType,T.ItemID ItemRef, UnitRef,
         UnitTitle, UnitTitle_En, TotalQuantity,StockQuantity,TracingQuantity,StockTracingQuantity,[Order]  
         FROM [INV].[fnItemStockSummary](T.StockID, T.ItemID, T.TracingID, T.FiscalYearID)  )fn`,
        );
      }

      console.log('Start inserting SummaryTable...');

      await queryRunner.commitTransaction();

      return {
        quotationNumber: sepidarQuotation.Number,
        quotationId: sepidarQuotation.QuotationId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getQuotationById(quotationId: number): Promise<SepidarQuotationDTO> {
    try {
      console.log('seraching for ' + quotationId);

      const data = await this.mssqlDataSource.query(
        `SELECT  [FiscalYearRef],[SaleTypeMarket],[CustomerIdentificationCode],[CustomerEconomicCode], 
      [CustomerState], [CustomerCity], [CustomerVillage], [CustomerZipCode], [CustomerPhone], [QuotationId], [Number], [CustomerPartyRef],[Date], 
      [CustomerPartyDLCode], [CustomerPartyName], [PartyAddressRef], [CustomerPartyName_En], [PartyAddress], [PartyAddress_En], [SaleTypeTitle], 
      [SaleTypeRef], [SaleTypeTitle_En], [NetPrice], [ExpirationDate], [CurrencyRef], [CurrencyTitle], [CurrencyTitle_En], [Price], [Discount], 
      [Addition], [Tax], [DiscountInBaseCurrency], [AdditionInBaseCurrency], [TaxInBaseCurrency], [DutyInBaseCurrency], [NetPriceInBaseCurrency], 
      [Duty], [PriceInBaseCurrency], [SaleTypeNumber], [Rate], [CustomerFax], [DeliveryLocationRef], [Version], [CustomerEMail], [DeliveryLocationTitle], 
      [Creator], [CustomerPartyDLRef], [DeliveryLocationTitle_En], [CreationDate], [CustomerCity_En], [LastModifier], [CustomerState_En], [LastModificationDate], 
      [BillRemainder], [Closed], [VendorRemainder], [DiscountOnCustomer], [CustomerRemainder], [CurrencyPrecisionCount], [CustomerGroupingRef], 
      [CustomerGroupingTitle], [ReceiptRef], [PaymentRef], [RemainedDaysToExpiration], [CreatorName], [CustomerRealName], [CustomerRealName_En], 
      [Guid], [AdditionFactor_VatEffective], [AdditionFactorInBaseCurrency_VatEffective], [AdditionFactor_VatIneffective], 
      [AdditionFactorInBaseCurrency_VatIneffective] FROM SLS.[vwQuotation]  WHERE [QuotationId] =@0`,
        [quotationId],
      );
      if (data?.length == 0 || data[0] == null)
        console.log(` Sepidar Quotation Id [${quotationId}] not found`);

      return data[0];
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getQuotationItemsById(
    quotationId: number,
  ): Promise<SepidarQuotationItemDTO[]> {
    const data = await this.mssqlDataSource.query(
      `SELECT  [ItemSecondaryUnitRef], [ItemType], [CustomerDiscountRate], [PriceInfoDiscountRate], [TracingRef], 
      [TaxExempt], [Description], [Description_En], [UnitTitle], [ItemBarCode], [ItemIranCode], [UnitTitle_En], [DiscountQuotationItemRef], 
      [PriceInfoPriceDiscount], [PriceInfoPercentDiscount], [SerialTracking], [ProductPackRef], [ProductPackTitle], [ProductPackQuantity], 
      [ItemSaleGroupRef], [ItemPurchaseGroupRef], [IsAggregateDiscountInvoiceItem], [QuotationItemID], [QuotationRef], [RowID], [ItemRef], 
      [ItemCode], [ItemTitle], [ItemTitle_En], [ItemIsUnitRatioConstant], [ItemUnitsRatio], [ItemTracingCategoryRef], [StockRef], [TracingTitle], [StockCode], 
      [StockTitle], [StockTitle_En], [Quantity], [SecondaryQuantity], [Fee], [Discount], [PriceInBaseCurrency], [DiscountInBaseCurrency], [AdditionInBaseCurrency], 
      [TaxInBaseCurrency], [DutyInBaseCurrency], [NetPriceInBaseCurrency], [Addition], [Tax], [Duty], [Rate], [Price], [UsedQuantity], 
      [AggregateAmountDiscountRate], [CalculationFormulaRef], [DeliveredQuantity], [CustomerDiscount], [PropertyAmounts], [AggregateAmountPriceDiscount], 
      [AggregateAmountPercentDiscount], [AdditionFactor_VatEffective], [AdditionFactor_VatIneffective], [AdditionFactorInBaseCurrency_VatEffective], 
      [AdditionFactorInBaseCurrency_VatIneffective] FROM SLS.[vwQuotationItem]   WHERE ([QuotationRef] = @0 )`,
      [quotationId],
    );
    return data;
  }

  async createInvoice(invoice: Invoice, invoiceGoods: InvoiceGoods[]) {
    const { FiscalYearId } = await this.getFiscalYearAndId();
    if (!FiscalYearId) throw new BadRequestException('سال مالی معتبر نیست');
    const sepidarQuotation = invoice?.proforma?.sepidarId
      ? await this.getQuotationById(Number(invoice?.proforma?.sepidarId!))
      : undefined;
    console.log('Hesabyar proforma Sepidar ID:' + invoice.proforma.sepidarId);

    const sepidarQuotationItems = invoice.proforma.sepidarId
      ? await this.getQuotationItemsById(Number(invoice?.proforma?.sepidarId!))
      : undefined;
    const sepidarInvoice = await this.initiatNewSepidarInvoice(
      invoice,
      FiscalYearId,
    );

    const sepidarInvoiceItems: SepidarInvoiceItemDTO[] = [];
    for (const invoiceItem of invoiceGoods) {
      let i = 1;
      const sepidarNewItem = await this.initiatNewSepidarInvoiceItems(
        i,
        invoiceItem.quantity,
        invoiceItem.total,
        invoiceItem?.good?.sepidarId!,
        invoiceItem.price,
        sepidarInvoice.InvoiceId,
        invoice.stockRef,
      );
      sepidarInvoiceItems.push(sepidarNewItem);
      i++;
    }

    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('Start Inserting invoice...');
      await queryRunner.manager.insert('SLS.Invoice', sepidarInvoice);
      console.log(`Invoice number ${sepidarInvoice.Number} Added...`);
      console.log('Start Inserting invoiceItems...');
      for (const item of sepidarInvoiceItems) {
        await queryRunner.manager.insert('SLS.InvoiceItem', item);
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${item.StockRef}, ${item.ItemRef}, NULL, ${FiscalYearId}, 0 )  Exec [INV].[spLockItemStockSummary] @SummaryTable`,
        );
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${item.StockRef}, ${item.ItemRef}, NULL, ${FiscalYearId}, 0 )  Exec [INV].[spUpdateItemStockSummary] @SummaryTable , 0`,
        );
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${item.StockRef}, ${item.ItemRef}, NULL, ${FiscalYearId}, 0)
         Select fn.*  FROM @SummaryTable T   CROSS APPLY  ( Select ItemStockSummaryType,T.ItemID ItemRef, UnitRef,
         UnitTitle, UnitTitle_En, TotalQuantity,StockQuantity,TracingQuantity,StockTracingQuantity,[Order]  
         FROM [INV].[fnItemStockSummary](T.StockID, T.ItemID, T.TracingID, T.FiscalYearID)  )fn`,
        );
      }

      console.log('Sepidar QuotationId: ' + sepidarQuotation?.QuotationId);
      console.log(
        'Sepidar QuotationItem count: ' + sepidarQuotationItems?.length,
      );
      console.log(sepidarQuotation);

      if (sepidarQuotation && sepidarQuotationItems)
        await this.updateQuotationAfterCreateInvoice(
          queryRunner,
          sepidarQuotation,
          sepidarQuotationItems,
          sepidarInvoice,
          sepidarInvoiceItems,
        );
      console.log('Start Inserting Voucher...');
      const { voucherId } = await this.createVoucher(
        queryRunner,
        sepidarInvoice,
        Number(invoice.createdBy.sepidarId),
      );
      sepidarInvoice.VoucherRef = voucherId;
      await queryRunner.query(
        `UPDATE SLS.Invoice SET VoucherRef=@0 WHERE InvoiceId=@1`,
        [voucherId, sepidarInvoice.InvoiceId],
      );

      await queryRunner.commitTransaction();

      return {
        invoiceNumber: sepidarInvoice.Number,
        invoiceId: sepidarInvoice.InvoiceId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateQuotationAfterCreateInvoice(
    queryRunner: QueryRunner,
    sepidarQuotation: SepidarQuotationDTO,
    sepidarQuotaionItems: SepidarQuotationItemDTO[],
    sepidarInvoice: SepidarInvoiceDTO,
    sepidarInvoiceItems: SepidarInvoiceItemDTO[],
  ) {
    const FiscalYearId = sepidarInvoice.FiscalYearRef;
    const quotationId = sepidarQuotation.QuotationId;
    try {
      console.log('Start updating Quotation...');
      await queryRunner.query(
        `UPDATE SLS.Quotation SET Closed=1, LastModificationDate=@0 WHERE QuotationId=@1`,
        [new Date(), quotationId],
      );

      for (let i: number = 0; i < sepidarInvoiceItems.length; i++) {
        console.log('Start updating QuotationItems...');
        const newItem = this.updateSepidarQuotationItem(
          sepidarInvoiceItems[i],
          sepidarQuotaionItems[i],
        );
        console.log(newItem);
        await queryRunner.query(
          `UPDATE SLS.QuotationItem SET AdditionFactor_VatEffective=@0,AdditionFactor_VatIneffective=@1,CustomerDiscountRate =@2,
           PriceInfoDiscountRate =@3,Description =@4,Description_En=@5,DiscountQuotationItemRef=@6,PriceInfoPriceDiscount=@7,PriceInfoPercentDiscount=@8,
           CustomerDiscount = @9,ProductPackRef =@10,ProductPackQuantity=@11,AggregateAmountPercentDiscount=@12,AdditionFactorInBaseCurrency_VatEffective =@13,      
           AdditionFactorInBaseCurrency_VatIneffective =@14,RowID = @15,ItemRef = @16,StockRef = @17,TracingRef = @18,Quantity = @19,UsedQuantity =@20,
           SecondaryQuantity = @21,Fee = @22, Price = @23, Discount = @24,Addition = @25, Tax = @26,PriceInBaseCurrency =@27,DiscountInBaseCurrency =@28,
           TaxInBaseCurrency = @29,DutyInBaseCurrency =@30, NetPriceInBaseCurrency =@31,Duty = @32,Rate = @33,AggregateAmountPriceDiscount =@34,
           AggregateAmountDiscountRate =@35 
           WHERE QuotationItemId=@36`,
          [
            sepidarInvoiceItems[i].AdditionFactor_VatEffective, //0
            sepidarInvoiceItems[i].AdditionFactor_VatIneffective, //1
            sepidarInvoiceItems[i].CustomerDiscountRate, //2
            sepidarInvoiceItems[i].PriceInfoDiscountRate, //3
            sepidarInvoiceItems[i].Description, //4
            sepidarInvoiceItems[i].Description_En, //5
            sepidarInvoiceItems[i].DiscountInvoiceItemRef, //6
            sepidarInvoiceItems[i].PriceInfoPriceDiscount, //7
            sepidarInvoiceItems[i].PriceInfoPercentDiscount, //8
            sepidarInvoiceItems[i].CustomerDiscount, //9
            sepidarInvoiceItems[i].ProductPackRef, //10
            sepidarInvoiceItems[i].ProductPackQuantity, //11
            sepidarInvoiceItems[i].AggregateAmountPercentDiscount, //12
            sepidarInvoiceItems[i].AdditionFactorInBaseCurrency_VatEffective, //13
            sepidarInvoiceItems[i].AdditionFactorInBaseCurrency_VatIneffective, //14
            sepidarInvoiceItems[i].RowID, //15
            sepidarInvoiceItems[i].ItemRef, //16
            sepidarInvoiceItems[i].StockRef, //17
            sepidarInvoiceItems[i].TracingRef, //18
            sepidarInvoiceItems[i].Quantity, //19
            sepidarInvoiceItems[i].Quantity, //20
            sepidarInvoiceItems[i].SecondaryQuantity, //21
            sepidarInvoiceItems[i].Fee, //22
            sepidarInvoiceItems[i].Price, //23
            sepidarInvoiceItems[i].Discount, //24
            sepidarInvoiceItems[i].Addition, //25
            sepidarInvoiceItems[i].Tax, //26
            sepidarInvoiceItems[i].PriceInBaseCurrency, //27
            sepidarInvoiceItems[i].DiscountInBaseCurrency, //28
            sepidarInvoiceItems[i].TaxInBaseCurrency, //29
            sepidarInvoiceItems[i].DutyInBaseCurrency, //30
            sepidarInvoiceItems[i].NetPriceInBaseCurrency, //31
            sepidarInvoiceItems[i].Duty, //32
            sepidarInvoiceItems[i].Rate, //33
            sepidarInvoiceItems[i].AggregateAmountPriceDiscount, //34
            sepidarInvoiceItems[i].AggregateAmountDiscountRate, //35
            sepidarQuotaionItems[i].QuotationItemID, //36
          ],
        );
        console.log('Start inserting SummaryTable...');
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${sepidarInvoiceItems[i].StockRef}, ${sepidarInvoiceItems[i].ItemRef}, NULL, ${FiscalYearId}, 0 )  Exec [INV].[spLockItemStockSummary] @SummaryTable`,
        );
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${sepidarInvoiceItems[i].StockRef}, ${sepidarInvoiceItems[i].ItemRef}, NULL, ${FiscalYearId}, 0 )  Exec [INV].[spUpdateItemStockSummary] @SummaryTable , 0`,
        );
        await queryRunner.manager.query(
          `DECLARE @SummaryTable INV.SummaryRecordTable  
         INSERT INTO @SummaryTable VALUES(${sepidarInvoiceItems[i].StockRef}, ${sepidarInvoiceItems[i].ItemRef}, NULL, ${FiscalYearId}, 0)
         Select fn.*  FROM @SummaryTable T   CROSS APPLY  ( Select ItemStockSummaryType,T.ItemID ItemRef, UnitRef,
         UnitTitle, UnitTitle_En, TotalQuantity,StockQuantity,TracingQuantity,StockTracingQuantity,[Order]  
         FROM [INV].[fnItemStockSummary](T.StockID, T.ItemID, T.TracingID, T.FiscalYearID)  )fn`,
        );
      }

      return {
        quotationNumber: sepidarQuotation.Number,
        quotationId: sepidarQuotation.QuotationId,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createVoucher(
    queryRunner: QueryRunner,
    sepidarInvoice: SepidarInvoiceDTO,
    userId: number,
  ) {
    let mustRelease = false;
    if (!queryRunner) {
      throw new BadRequestException('QueryRunner is null');
    }
    try {
      console.log('Start inserting new voucher...');
      const voucher = await this.initNewVoucher(
        queryRunner,
        sepidarInvoice,
        sepidarInvoice.FiscalYearRef,
        userId,
      );

      await queryRunner.manager.insert('ACC.Voucher', voucher);

      console.log('ُStart inserting new voucher items...');
      const voucherItem1 = await this.initNewVoucherItem(
        sepidarInvoice,
        voucher,
        1,
      );
      await queryRunner.manager.insert('ACC.VoucherItem', voucherItem1);

      const voucherItem2 = await this.initNewVoucherItem(
        sepidarInvoice,
        voucher,
        2,
      );
      await queryRunner.manager.insert('ACC.VoucherItem', voucherItem2);
      console.log(voucherItem2);

      if (mustRelease) await queryRunner.commitTransaction();
      return { voucherNumber: voucher.Number, voucherId: voucher.VoucherId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      if (mustRelease) await queryRunner.release();
    }
  }

  async initiatNewSepidarInvoice(savedInvoice: Invoice, fiscalYearId: number) {
    const newsSepidarInvoice = new SepidarInvoiceDTO();
    newsSepidarInvoice.FiscalYearRef = fiscalYearId;
    newsSepidarInvoice.VoucherRef = undefined;
    newsSepidarInvoice.PriceInBaseCurrency = savedInvoice.totalAmount;
    newsSepidarInvoice.BaseOnInventoryDelivery = false;
    newsSepidarInvoice.OrderRef = undefined;
    newsSepidarInvoice.ShouldControlCustomerCredit = true;
    newsSepidarInvoice.AgreementRef = undefined;
    newsSepidarInvoice.TaxPayerBillIssueDateTime = new Date();
    newsSepidarInvoice.SettlementType = 1;
    newsSepidarInvoice.Description = '';
    newsSepidarInvoice.InvoiceId = (await this.getNextId('SLS.Invoice')).LastId;
    newsSepidarInvoice.Number = (
      await this.getNextInvoiceNumber(
        fiscalYearId,
        newsSepidarInvoice.InvoiceId,
      )
    ).Number;
    newsSepidarInvoice.CustomerPartyRef = savedInvoice.customer.sepidarId;
    newsSepidarInvoice.Date = new Date();
    newsSepidarInvoice.CustomerRealName =
      savedInvoice.customer.customerLName +
      ' ' +
      savedInvoice.customer.customerFName;
    newsSepidarInvoice.SaleTypeRef = 1;
    newsSepidarInvoice.CustomerRealName_En =
      savedInvoice.customer.customerLName +
      ' ' +
      savedInvoice.customer.customerFName;
    newsSepidarInvoice.PartyAddressRef = undefined;
    newsSepidarInvoice.State = 1;
    newsSepidarInvoice.CurrencyRef = 1;
    newsSepidarInvoice.SLRef = 420;
    newsSepidarInvoice.DiscountInBaseCurrency = 0;
    newsSepidarInvoice.AdditionInBaseCurrency = 0;
    newsSepidarInvoice.TaxInBaseCurrency = 0;
    newsSepidarInvoice.DutyInBaseCurrency = 0;
    newsSepidarInvoice.NetPriceInBaseCurrency = savedInvoice.totalAmount;
    newsSepidarInvoice.Price = savedInvoice.totalAmount;
    newsSepidarInvoice.Discount = 0;
    newsSepidarInvoice.DeliveryLocationRef = 1;
    newsSepidarInvoice.Addition = 0;
    newsSepidarInvoice.Tax = 0;
    newsSepidarInvoice.Duty = 0;
    newsSepidarInvoice.Rate = 1;
    newsSepidarInvoice.Version = 1;
    newsSepidarInvoice.Creator = Number(savedInvoice.createdBy.sepidarId);
    newsSepidarInvoice.CreationDate = new Date();
    newsSepidarInvoice.LastModifier = Number(savedInvoice.createdBy.sepidarId);
    newsSepidarInvoice.LastModificationDate = new Date();
    newsSepidarInvoice.QuotationRef = savedInvoice?.proforma
      ? savedInvoice.proforma.sepidarId + ''
      : undefined;
    newsSepidarInvoice.Guid = undefined;
    newsSepidarInvoice.AdditionFactor_VatEffective = 0;
    newsSepidarInvoice.AdditionFactorInBaseCurrency_VatEffective = 0;
    newsSepidarInvoice.AdditionFactor_VatIneffective = 0;
    newsSepidarInvoice.AdditionFactorInBaseCurrency_VatIneffective = 0;
    console.log(newsSepidarInvoice);

    return newsSepidarInvoice;
  }

  async initiatNewSepidarInvoiceItems(
    itemNumber: number,
    quantity: number,
    price: number,
    itemId: number,
    itemFee: number,
    invoiceId: number,
    stockRef: number,
  ) {
    console.log(itemId);

    const item = new SepidarInvoiceItemDTO();
    item.AdditionFactor_VatEffective = 0;
    item.AdditionFactor_VatIneffective = 0;
    item.QuotationItemRef = undefined;
    item.CustomerDiscountRate = 0;
    item.PriceInfoDiscountRate = 0;
    item.Description = undefined;
    item.Description_En = undefined;
    item.DiscountInvoiceItemRef = undefined;
    item.PriceInfoPriceDiscount = 0;
    item.PriceInfoPercentDiscount = 0;
    item.CustomerDiscount = 0;
    item.OrderItemRef = undefined;
    item.ProductPackRef = undefined;
    item.ProductPackQuantity = undefined;
    item.AggregateAmountPercentDiscount = 0;
    item.AdditionFactorInBaseCurrency_VatEffective = 0;
    item.AdditionFactorInBaseCurrency_VatIneffective = 0;
    item.DiscountItemGroupRef = undefined;
    item.BankFeeForCurrencySale = 0;
    item.BankFeeForCurrencySaleInBaseCurrency = 0;
    item.IsAggregateDiscountInvoiceItem = false;
    item.TaxPayerCurrencyPurchaseRate = 0;
    item.InvoiceItemId = (await this.getNextId('SLS.InvoiceItem')).LastId;
    item.InvoiceRef = invoiceId;
    item.RowID = itemNumber;
    item.ItemRef = itemId;
    item.StockRef = stockRef;
    item.TracingRef = undefined;
    item.Quantity = quantity;
    item.SecondaryQuantity = undefined;
    item.Fee = itemFee;
    item.Price = price;
    item.Discount = 0;
    item.Addition = 0;
    item.Tax = 0;
    item.PriceInBaseCurrency = price;
    item.DiscountInBaseCurrency = 0;
    item.AdditionInBaseCurrency = 0;
    item.TaxInBaseCurrency = 0;
    item.DutyInBaseCurrency = 0;
    item.NetPriceInBaseCurrency = price;
    item.Duty = 0;
    item.Rate = 1;
    item.AggregateAmountPriceDiscount = 0;
    item.AggregateAmountDiscountRate = 0;
    return item;
  }

  async initiatNewSepidarQuotation(
    savedQuotation: Proforma,
    fiscalYearId: number,
  ) {
    const newsSepidarQuotation = new SepidarQuotationDTO();
    newsSepidarQuotation.FiscalYearRef = fiscalYearId;
    // newsSepidarQuotation.VoucherRef = undefined;
    newsSepidarQuotation.PriceInBaseCurrency = savedQuotation.totalAmount;
    // newsSepidarQuotation.BaseOnInventoryDelivery = false;
    // newsSepidarQuotation.OrderRef = undefined;
    // newsSepidarQuotation.ShouldControlCustomerCredit = true;
    // newsSepidarQuotation.AgreementRef = undefined;
    // newsSepidarQuotation.TaxPayerBillIssueDateTime = new Date();
    // newsSepidarQuotation.SettlementType = 1;
    // newsSepidarQuotation.Description = '';
    newsSepidarQuotation.QuotationId = (
      await this.getNextId('SLS.Quotation')
    ).LastId;
    newsSepidarQuotation.Number = (
      await this.getNextQuotationNumber(
        fiscalYearId,
        newsSepidarQuotation.QuotationId,
      )
    ).Number;
    newsSepidarQuotation.CustomerPartyRef = savedQuotation.customer.sepidarId;
    newsSepidarQuotation.Date = new Date();
    newsSepidarQuotation.ExpirationDate = savedQuotation.expirationDate;
    newsSepidarQuotation.CustomerRealName =
      savedQuotation.customer.customerLName +
      ' ' +
      savedQuotation.customer.customerFName;
    newsSepidarQuotation.SaleTypeRef = 1;
    newsSepidarQuotation.CustomerRealName_En =
      savedQuotation.customer.customerLName +
      ' ' +
      savedQuotation.customer.customerFName;
    newsSepidarQuotation.PartyAddressRef = undefined;
    newsSepidarQuotation.Closed = false;
    newsSepidarQuotation.CurrencyRef = 1;
    // newsSepidarQuotation.SLRef = 420;
    newsSepidarQuotation.DiscountInBaseCurrency = 0;
    newsSepidarQuotation.AdditionInBaseCurrency = 0;
    newsSepidarQuotation.TaxInBaseCurrency = 0;
    newsSepidarQuotation.DutyInBaseCurrency = 0;
    newsSepidarQuotation.NetPriceInBaseCurrency = savedQuotation.totalAmount;
    newsSepidarQuotation.Price = savedQuotation.totalAmount;
    newsSepidarQuotation.Discount = 0;
    newsSepidarQuotation.DeliveryLocationRef = 1;
    newsSepidarQuotation.Addition = 0;
    newsSepidarQuotation.Tax = 0;
    newsSepidarQuotation.Duty = 0;
    newsSepidarQuotation.Rate = 1;
    newsSepidarQuotation.Version = 1;
    newsSepidarQuotation.Creator = Number(savedQuotation.createdBy.sepidarId);
    newsSepidarQuotation.CreationDate = new Date();
    newsSepidarQuotation.LastModifier = Number(
      savedQuotation.createdBy.sepidarId,
    );
    newsSepidarQuotation.LastModificationDate = new Date();
    newsSepidarQuotation.Guid = undefined;
    newsSepidarQuotation.AdditionFactor_VatEffective = 0;
    newsSepidarQuotation.AdditionFactorInBaseCurrency_VatEffective = 0;
    newsSepidarQuotation.AdditionFactor_VatIneffective = 0;
    newsSepidarQuotation.AdditionFactorInBaseCurrency_VatIneffective = 0;

    return newsSepidarQuotation;
  }

  async initiatNewSepidarQuotationItems(
    itemNumber: number,
    quantity: number,
    price: number,
    itemRef: number,
    itemFee: number,
    quotationId: number,
    stockRef: number,
  ) {
    console.log(itemRef);
    const item = new SepidarQuotationItemDTO();
    item.AdditionFactor_VatEffective = 0;
    item.AdditionFactor_VatIneffective = 0;
    item.CustomerDiscountRate = 0;
    item.PriceInfoDiscountRate = 0;
    item.Description = undefined;
    item.Description_En = undefined;
    item.DiscountQuotationItemRef = undefined;
    item.PriceInfoPriceDiscount = 0;
    item.PriceInfoPercentDiscount = 0;
    item.CustomerDiscount = 0;
    item.ProductPackRef = undefined;
    item.ProductPackQuantity = undefined;
    item.AggregateAmountPercentDiscount = 0;
    item.AdditionFactorInBaseCurrency_VatEffective = 0;
    item.AdditionFactorInBaseCurrency_VatIneffective = 0;
    item.QuotationItemID = (await this.getNextId('SLS.QuotationItem')).LastId;
    item.QuotationRef = quotationId;
    item.RowID = itemNumber;
    item.ItemRef = itemRef;
    item.StockRef = stockRef;
    item.TracingRef = undefined;
    item.Quantity = quantity;
    item.UsedQuantity = quantity;
    item.SecondaryQuantity = undefined;
    item.Fee = itemFee;
    item.Price = price;
    item.Discount = 0;
    item.Addition = 0;
    item.Tax = 0;
    item.PriceInBaseCurrency = price;
    item.DiscountInBaseCurrency = 0;
    item.TaxInBaseCurrency = 0;
    item.DutyInBaseCurrency = 0;
    item.NetPriceInBaseCurrency = price;
    item.Duty = 0;
    item.Rate = 1;
    item.AggregateAmountPriceDiscount = 0;
    item.AggregateAmountDiscountRate = 0;
    return item;
  }

  updateSepidarQuotationItem(
    sepidarInvoiceItem: SepidarInvoiceItemDTO,
    sepidarQuotationItem: SepidarQuotationItemDTO,
  ): SepidarQuotationItemDTO {
    sepidarQuotationItem.AdditionFactor_VatEffective =
      sepidarInvoiceItem.AdditionFactor_VatEffective;
    sepidarQuotationItem.AdditionFactor_VatIneffective =
      sepidarInvoiceItem.AdditionFactor_VatIneffective;
    sepidarQuotationItem.CustomerDiscountRate =
      sepidarInvoiceItem.CustomerDiscountRate;
    sepidarQuotationItem.PriceInfoDiscountRate =
      sepidarInvoiceItem.PriceInfoDiscountRate;
    sepidarQuotationItem.Description = sepidarInvoiceItem.Description;
    sepidarQuotationItem.Description_En = sepidarInvoiceItem.Description_En;
    sepidarQuotationItem.DiscountQuotationItemRef =
      sepidarInvoiceItem.DiscountInvoiceItemRef;
    sepidarQuotationItem.PriceInfoPriceDiscount =
      sepidarInvoiceItem.PriceInfoPriceDiscount;
    sepidarQuotationItem.PriceInfoPercentDiscount =
      sepidarInvoiceItem.PriceInfoPercentDiscount;
    sepidarQuotationItem.CustomerDiscount = sepidarInvoiceItem.CustomerDiscount;
    sepidarQuotationItem.ProductPackRef = sepidarInvoiceItem.ProductPackRef;
    sepidarQuotationItem.ProductPackQuantity =
      sepidarInvoiceItem.ProductPackQuantity;
    sepidarQuotationItem.AggregateAmountPercentDiscount =
      sepidarInvoiceItem.AggregateAmountPercentDiscount;
    sepidarQuotationItem.AdditionFactorInBaseCurrency_VatEffective =
      sepidarInvoiceItem.AdditionFactorInBaseCurrency_VatEffective;
    sepidarQuotationItem.AdditionFactorInBaseCurrency_VatIneffective =
      sepidarInvoiceItem.AdditionFactorInBaseCurrency_VatIneffective;
    sepidarQuotationItem.QuotationItemID = sepidarInvoiceItem.InvoiceItemId;
    //sepidarQuotationItem.QuotationRef = quotationId;
    sepidarQuotationItem.RowID = sepidarInvoiceItem.RowID;
    sepidarQuotationItem.ItemRef = sepidarInvoiceItem.ItemRef;
    sepidarQuotationItem.StockRef = sepidarInvoiceItem.StockRef;
    sepidarQuotationItem.TracingRef = sepidarInvoiceItem.TracingRef;
    sepidarQuotationItem.Quantity = sepidarInvoiceItem.Quantity;
    sepidarQuotationItem.UsedQuantity = sepidarInvoiceItem.Quantity;
    sepidarQuotationItem.SecondaryQuantity =
      sepidarInvoiceItem.SecondaryQuantity;
    sepidarQuotationItem.Fee = sepidarInvoiceItem.Fee;
    sepidarQuotationItem.Price = sepidarInvoiceItem.Price;
    sepidarQuotationItem.Discount = sepidarInvoiceItem.Discount;
    sepidarQuotationItem.Addition = sepidarInvoiceItem.Addition;
    sepidarQuotationItem.Tax = sepidarInvoiceItem.Tax;
    sepidarQuotationItem.PriceInBaseCurrency =
      sepidarInvoiceItem.PriceInBaseCurrency;
    sepidarQuotationItem.DiscountInBaseCurrency =
      sepidarInvoiceItem.DiscountInBaseCurrency;
    sepidarQuotationItem.TaxInBaseCurrency =
      sepidarInvoiceItem.TaxInBaseCurrency;
    sepidarQuotationItem.DutyInBaseCurrency =
      sepidarInvoiceItem.DutyInBaseCurrency;
    sepidarQuotationItem.NetPriceInBaseCurrency =
      sepidarInvoiceItem.NetPriceInBaseCurrency;
    sepidarQuotationItem.Duty = sepidarInvoiceItem.Duty;
    sepidarQuotationItem.Rate = sepidarInvoiceItem.Rate;
    sepidarQuotationItem.AggregateAmountPriceDiscount =
      sepidarInvoiceItem.AggregateAmountPercentDiscount;
    sepidarQuotationItem.AggregateAmountDiscountRate =
      sepidarInvoiceItem.AggregateAmountDiscountRate;
    return sepidarQuotationItem;
  }

  async getVoucehrDescription(invoiceNumber: number, toCustomer: string = '') {
    const data = await this.mssqlDataSource
      .query(`SELECT [Number], [SaleTypeId], [Title], [Title_En], [Version], [Creator], [CreationDate], [LastModifier], 
      [LastModificationDate], [SaleTypeMarket], [PartSalesSLRef], [PartSalesSLCode], [PartSalesSLTitle], [ServiceSalesSLRef], [ServiceSalesSLCode], [ServiceSalesSLTitle],
      [PartSalesReturnSLRef], [PartSalesReturnSLCode], [PartSalesReturnSLTitle], [ServiceSalesReturnSLRef], [ServiceSalesReturnSLCode], [ServiceSalesReturnSLTitle], 
      [PartSalesDiscountSLRef], [PartSalesDiscountSLCode], [PartSalesDiscountSLTitle], [ServiceSalesDiscountSLRef], [ServiceSalesDiscountSLCode], 
      [ServiceSalesDiscountSLTitle], [SalesAdditionSLRef], [SalesAdditionSLCode], [SalesAdditionSLTitle] FROM SLS.[vwSaleType]   WHERE SaleTypeId = 1`);
    const date = new Date();

    const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const persianDate = formatter.format(date);
    let description = `بابت فاکتور شماره ${invoiceNumber} `;
    description += `تاریخ ${persianDate} `;
    description += `نوع فروش ${data[0].Title} `;
    if (toCustomer) description += `به ${toCustomer}`;
    return description;
  }

  async initNewVoucher(
    queryRunner: QueryRunner,
    invoice: SepidarInvoiceDTO,
    fiscalYearId: number,
    userId: number,
  ) {
    const sepidarVoucher = new SepidarVoucherDTO();
    sepidarVoucher.VoucherId = (await this.getNextId('ACC.Voucher')).LastId;
    sepidarVoucher.Number = (
      await this.getNextVoucherNumber(fiscalYearId, invoice.InvoiceId)
    ).Number;
    sepidarVoucher.DailyNumber = (
      await this.getNextVoucherDailyNumber(queryRunner)
    ).NextDailyNumber;
    sepidarVoucher.FiscalYearRef = fiscalYearId;
    sepidarVoucher.ReferenceNumber = sepidarVoucher.Number;
    sepidarVoucher.Date = new Date();
    sepidarVoucher.Type = 2;
    sepidarVoucher.IsMerged = true;
    sepidarVoucher.State = true;
    sepidarVoucher.Description = await this.getVoucehrDescription(
      invoice.Number,
    );
    sepidarVoucher.Description_En = sepidarVoucher.Description;
    sepidarVoucher.Version = 1;
    sepidarVoucher.CreationDate = new Date();
    sepidarVoucher.Creator = userId;
    sepidarVoucher.LastModifier = userId;
    sepidarVoucher.LastModificationDate = sepidarVoucher.CreationDate;
    sepidarVoucher.IssuerSystem = 0;
    return sepidarVoucher;
  }

  async initNewVoucherItem(
    invoice: SepidarInvoiceDTO,
    voucher: SepidarVoucherDTO,
    voucherItemType: number,
  ) {
    const voucherItem = new SepidarVoucherItemDTO();
    voucherItem.VoucherItemId = (
      await this.getNextId('ACC.VoucherItem')
    ).LastId;
    voucherItem.VoucherRef = voucher.VoucherId;
    voucherItem.RowNumber = 1;
    let description = '';
    if (voucherItemType == 1) {
      const customer = await this.getCustomerById(invoice.CustomerPartyRef);
      voucherItem.DLRef = customer.DLRef;
      voucherItem.AccountSLRef = 420;
      voucherItem.Debit = invoice.Price;
      voucherItem.Credit = 0;
      description = await this.getVoucehrDescription(invoice.Number);
    } else {
      voucherItem.DLRef = undefined;
      voucherItem.AccountSLRef = 423;
      voucherItem.Debit = 0;
      voucherItem.Credit = invoice.Price;
      description = await this.getVoucehrDescription(
        invoice.Number,
        invoice.CustomerRealName,
      );
    }
    voucherItem.Description = description;
    voucherItem.Description_En = description;
    voucherItem.CurrencyRef = undefined;
    voucherItem.TrackingNumber = undefined;
    voucherItem.TrackingDate = undefined;
    voucherItem.CurrencyCredit = undefined;
    voucherItem.CurrencyDebit = undefined;
    voucherItem.IssuerEntityName =
      'SG.Sales.InvoiceManagement.Common.DsInvoice, SG.Sales.InvoiceManagement.Common, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    voucherItem.IssuerEntityRef = invoice.InvoiceId;
    voucherItem.CurrencyRate = undefined;
    voucherItem.Version = 1;
    return voucherItem;
  }
}
