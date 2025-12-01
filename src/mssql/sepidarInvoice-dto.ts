import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class SepidarInvoiceDTO {
  @IsInt() InvoiceId: number;
  @IsInt() FiscalYearRef: number;
  @IsOptional() @IsInt() VoucherRef?: number;
  @IsNumber() PriceInBaseCurrency: number;
  @IsBoolean() BaseOnInventoryDelivery: boolean;
  @IsOptional() @IsInt() OrderRef?: number;
  @IsBoolean() ShouldControlCustomerCredit: boolean;
  @IsOptional() @IsInt() AgreementRef?: number;
  @IsDate() TaxPayerBillIssueDateTime: Date;
  @IsInt() SettlementType: number;
  @IsOptional() @IsString() Description?: string;
  @IsInt() Number: number;
  @IsInt() CustomerPartyRef: number;
  @IsDate() Date: Date;
  @IsString() CustomerRealName: string;
  @IsInt() SaleTypeRef: number;
  @IsString() CustomerRealName_En: string;
  @IsOptional() @IsInt() PartyAddressRef?: number;
  @IsInt() State: number;
  @IsInt() CurrencyRef: number;
  @IsInt() SLRef: number;
  @IsNumber() DiscountInBaseCurrency: number;
  @IsNumber() AdditionInBaseCurrency: number;
  @IsNumber() TaxInBaseCurrency: number;
  @IsNumber() DutyInBaseCurrency: number;
  @IsNumber() NetPriceInBaseCurrency: number;
  @IsNumber() Price: number;
  @IsNumber() Discount: number;
  @IsOptional() @IsInt() DeliveryLocationRef?: number;
  @IsNumber() Addition: number;
  @IsNumber() Tax: number;
  @IsNumber() Duty: number;
  @IsNumber() Rate: number;
  @IsInt() Version: number;
  @IsInt() Creator: number;
  @IsDate() CreationDate: Date;
  @IsInt() LastModifier: number;
  @IsDate() LastModificationDate: Date;
  @IsString() QuotationRef?: string;
  @IsOptional() @IsString() Guid?: string;
  @IsNumber() AdditionFactor_VatEffective: number;
  @IsNumber() AdditionFactorInBaseCurrency_VatEffective: number;
  @IsNumber() AdditionFactor_VatIneffective: number;
  @IsNumber() AdditionFactorInBaseCurrency_VatIneffective: number;
}
