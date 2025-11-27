import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
    console.log(data);

    return data[0];
  }

  async getAllStock() {
    const data = await this.mssqlDataSource.query(
      'SELECT * FROM [INV].[Stock]',
    );
    console.log(data);

    return data;
  }

  async getNextId(resourceName: string): Promise<{ LastId: number }> {
    const data = await this.mssqlDataSource.query(
      `DECLARE @id int EXEC [FMK].[spGetNextId] '${resourceName}', @id output, 1 SELECT @Id as LastId`,
    );
    console.log(resourceName, data);

    return data[0];
  }

  async getNextInvoiceNumber(
    fiscalYearId: number,
    invoiceId: number,
  ): Promise<{ Number: number }> {
    await this.mssqlDataSource.query("Exec FMK.spGetLock 'InvoiceRow' ");
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'Select IsNull( Max(Number) + 1, 1)  as Number FROM SLS.[vwInvoice]  WHERE 1=1  And FiscalYearRef =${fiscalYearId}'`,
    );
    console.log(data);
    const checkExist = await this.mssqlDataSource.query(
      `Select Count(1) as exist from SLS.[vwInvoice] where [InvoiceId] <> ${invoiceId} And [Number] = ${data[0].Number} And [FiscalYearRef] = ${fiscalYearId} `,
    );
    if (checkExist[0].exist > 0)
      throw new BadRequestException(
        'شماره تکراری در سیستم پیدا شد، دوباره سعی کنید',
      );

    return data[0];
  }

  async getNextQuotationNumber(
    fiscalYearId: number,
    quotationId: number,
  ): Promise<{ Number: number }> {
    await this.mssqlDataSource.query("Exec FMK.spGetLock 'QuotationRow' ");
    const data = await this.mssqlDataSource.query(
      `exec sp_executesql N'Select IsNull( Max(Number) + 1, 1)  as Number FROM SLS.[vwQuotation]  WHERE 1=1  And FiscalYearRef =${fiscalYearId}'`,
    );
    console.log(data);
    const checkExist = await this.mssqlDataSource.query(
      `Select Count(1) as exist from SLS.[vwQuotation] where [QuotationId] <> ${quotationId} And [Number] = ${data[0].Number} And [FiscalYearRef] = ${fiscalYearId} `,
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

  async createInvoice(invoice: Invoice, invoiceGoods: InvoiceGoods[]) {
    const { FiscalYearId, FiscalYear } = await this.getFiscalYearAndId();

    const sepidarInvoice = await this.initiatNewSepidarInvoice(
      invoice,
      FiscalYearId,
      FiscalYear,
    );

    const sepidarInvoiceItems: SepidarInvoiceItemDTO[] = [];
    for (const invoiceItem of invoiceGoods) {
      let i = 1;
      const sepidarNewItem = await this.initiatNewSepidarInvoiceItems(
        i,
        invoiceItem.quantity,
        invoiceItem.price,
        invoiceItem?.good?.sepidarId!,
        sepidarInvoice.InvoiceId,
        invoice.stockRef,
      );
      sepidarInvoiceItems.push(sepidarNewItem);
      i++;
    }
    console.log(sepidarInvoice, sepidarInvoiceItems);
    console.log('Start inserting Invoice to Sql Server...');

    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const fiscalYear = await queryRunner.manager.query(
        `SELECT FiscalYearID FROM FMK.FiscalYear WHERE FiscalYearID=${FiscalYearId}`,
      );
      console.log(fiscalYear);

      if (!fiscalYear.length) throw new Error('سال مالی معتبر نیست');

      // for (const item of sepidarInvoiceItems) {
      //   await queryRunner.manager.query(
      //     `DECLARE @SummaryTable INV.SummaryRecordTable;
      //      INSERT INTO @SummaryTable VALUES(@0, @1, NULL, @2, 0);
      //      EXEC INV.spLockItemStockSummary @SummaryTable;`,
      //     [item.StockRef, item.ItemRef, FiscalYearId],
      //   );
      // }

      console.log('Start Inserting invoice...');

      await queryRunner.manager.insert('SLS.Invoice', sepidarInvoice);
      console.log('Start Inserting invoiceItems...');
      for (const item of sepidarInvoiceItems) {
        await queryRunner.manager.insert('SLS.InvoiceItem', item);
      }

      // for (const item of sepidarInvoiceItems) {
      //   await queryRunner.manager.query(
      //     `DECLARE @SummaryTable INV.SummaryRecordTable;
      //      INSERT INTO @SummaryTable VALUES(@0, @1, NULL, @2, 0);
      //      EXEC INV.spUpdateItemStockSummary @SummaryTable, 0;`,
      //     [item.StockRef, item.ItemRef, FiscalYearId],
      //   );
      // }
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

  // async createQuotation(
  //   quotation: SepidarQuotationDTO,
  //   quotationItems: SepidarQuotationItemDTO[],
  // ) {
  //   const queryRunner = this.mssqlDataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const fiscalYear = await queryRunner.manager.query(
  //       `SELECT FiscalYearID FROM FIN.FiscalYear WHERE FiscalYearID=@0`,
  //       [quotation.FiscalYearRef],
  //     );
  //     if (!fiscalYear.length) throw new Error('سال مالی معتبر نیست');
  //     await queryRunner.manager.insert('SLS.Quotation', quotation);
  //     for (const qItem of quotationItems) {
  //       await queryRunner.manager.insert('SLS.QuotationItem', qItem);
  //     }
  //     await queryRunner.commitTransaction();
  //     return { quotationNumber: quotation.Number };
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw new BadRequestException();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async createQuotation(proforma: Proforma, proformaGoods: ProformaGoods[]) {
    const { FiscalYearId, FiscalYear } = await this.getFiscalYearAndId();

    const sepidarQuotation = await this.initiatNewSepidarQuotation(
      proforma,
      FiscalYearId,
      FiscalYear,
    );

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
    console.log(sepidarQuotation, sepidarQuotationItems);
    console.log('Start inserting Quotation to Sql Server...');

    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const fiscalYear = await queryRunner.manager.query(
        `SELECT FiscalYearID FROM FMK.FiscalYear WHERE FiscalYearID=${FiscalYearId}`,
      );
      console.log(fiscalYear);

      if (!fiscalYear.length) throw new Error('سال مالی معتبر نیست');

      console.log('Start Inserting Quotation...');

      await queryRunner.manager.insert('SLS.Quotation', sepidarQuotation);
      console.log('Start Inserting QuotationItems...');
      for (const item of sepidarQuotationItems) {
        await queryRunner.manager.insert('SLS.QuotationItem', item);
      }

      console.log('Start inserting SummaryTable...');
      await queryRunner.manager.query(
        'DECLARE @SummaryTable INV.SummaryRecordTable  INSERT INTO @SummaryTable VALUES(5, 1050, NULL, 11, 0 )  Exec [INV].[spLockItemStockSummary] @SummaryTable',
      );
      await queryRunner.manager.query(
        'DECLARE @SummaryTable INV.SummaryRecordTable  INSERT INTO @SummaryTable VALUES(5, 1050, NULL, 11, 0 )  Exec [INV].[spUpdateItemStockSummary] @SummaryTable , 0',
      );
      await queryRunner.manager.query(
        'DECLARE @SummaryTable INV.SummaryRecordTable  INSERT INTO @SummaryTable VALUES(5, 1050, NULL, 11, 0)   Select fn.*  FROM @SummaryTable T   CROSS APPLY  ( Select ItemStockSummaryType,T.ItemID ItemRef, UnitRef, UnitTitle, UnitTitle_En, TotalQuantity,StockQuantity,TracingQuantity,StockTracingQuantity,[Order]  FROM [INV].[fnItemStockSummary](T.StockID, T.ItemID, T.TracingID, T.FiscalYearID)  )fn',
      );

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

  async createVoucher(
    voucher: SepidarVoucherDTO,
    voucherItems: SepidarVoucherItemDTO[],
  ) {
    const queryRunner = this.mssqlDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const fiscalYear = await queryRunner.manager.query(
        `SELECT FiscalYearID FROM FIN.FiscalYear WHERE FiscalYearID=@0`,
        [voucher.FiscalYearRef],
      );
      if (!fiscalYear.length) throw new Error('سال مالی معتبر نیست');
      await queryRunner.manager.insert('ACC.Voucher', voucher);
      for (const vItem of voucherItems) {
        await queryRunner.manager.insert('ACC.VoucherItem', vItem);
      }
      await queryRunner.commitTransaction();
      return { voucherNumber: voucher.Number };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  async updateInvoice(id: number, invoice: SepidarInvoiceDTO) {}

  async updateQuotation(id: number, quotation: SepidarQuotationDTO) {}

  async updateVoucher(id: number, voucher: SepidarVoucherDTO) {}

  async initiatNewSepidarInvoice(
    savedInvoice: Invoice,
    fiscalYearId: number,
    fiscalYear: string,
  ) {
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
    newsSepidarInvoice.Creator = savedInvoice.createdBy.id;
    newsSepidarInvoice.CreationDate = new Date();
    newsSepidarInvoice.LastModifier = savedInvoice.createdBy.id;
    newsSepidarInvoice.LastModificationDate = new Date();
    newsSepidarInvoice.QuotationRef = savedInvoice?.proforma
      ? savedInvoice.proforma.id + ''
      : '';
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
    invoiceId: number,
    stockRef: number,
  ) {
    console.log(itemId);

    const item = new SepidarInvoiceItemDTO();
    item.AdditionFactor_VatEffective = 0;
    item.AdditionFactor_VatIneffective = 0;
    item.QuotationItemRef = 8461;
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
    item.Fee = price;
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
    fiscalYear: string,
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
    newsSepidarQuotation.ExpirationDate = new Date();
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
    newsSepidarQuotation.Creator = savedQuotation.createdBy.id;
    newsSepidarQuotation.CreationDate = new Date();
    newsSepidarQuotation.LastModifier = savedQuotation.createdBy.id;
    newsSepidarQuotation.LastModificationDate = new Date();
    newsSepidarQuotation.Guid = undefined;
    newsSepidarQuotation.AdditionFactor_VatEffective = 0;
    newsSepidarQuotation.AdditionFactorInBaseCurrency_VatEffective = 0;
    newsSepidarQuotation.AdditionFactor_VatIneffective = 0;
    newsSepidarQuotation.AdditionFactorInBaseCurrency_VatIneffective = 0;
    console.log(newsSepidarQuotation);

    return newsSepidarQuotation;
  }

  async initiatNewSepidarQuotationItems(
    itemNumber: number,
    quantity: number,
    price: number,
    itemId: number,
    itemFee: number,
    quotationId: number,
    stockRef: number,
  ) {
    console.log(itemId);

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
    //item.OrderItemRef = undefined;
    item.ProductPackRef = undefined;
    item.ProductPackQuantity = undefined;
    item.AggregateAmountPercentDiscount = 0;
    item.AdditionFactorInBaseCurrency_VatEffective = 0;
    item.AdditionFactorInBaseCurrency_VatIneffective = 0;
    // item.DiscountItemGroupRef = undefined;
    // item.BankFeeForCurrencySale = 0;
    // item.BankFeeForCurrencySaleInBaseCurrency = 0;
    // item.IsAggregateDiscountInvoiceItem = false;
    // item.TaxPayerCurrencyPurchaseRate = 0;
    item.QuotationItemID = (await this.getNextId('SLS.QuotationItem')).LastId;
    item.QuotationRef = quotationId;
    item.RowID = itemNumber;
    item.ItemRef = itemId;
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
    // item.AdditionInBaseCurrency = 0;
    item.TaxInBaseCurrency = 0;
    item.DutyInBaseCurrency = 0;
    item.NetPriceInBaseCurrency = price;
    item.Duty = 0;
    item.Rate = 1;
    item.AggregateAmountPriceDiscount = 0;
    item.AggregateAmountDiscountRate = 0;
    return item;
  }
}
