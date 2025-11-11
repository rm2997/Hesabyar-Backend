// quotation.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class SepidarQuotationDTO {
  @IsInt() QuotationId: number;
  @IsInt() FiscalYearRef: number;
  @IsInt() Number: number;
  @IsInt() CustomerPartyRef: number;
  @IsDate() Date: Date;
  @IsOptional() @IsInt() PartyAddressRef?: number;
  @IsInt() SaleTypeRef: number;
  @IsDate() ExpirationDate: Date;
  @IsInt() CurrencyRef: number;
  @IsNumber() Price: number;
  @IsNumber() Discount: number;
  @IsNumber() Addition: number;
  @IsNumber() Tax: number;
  @IsNumber() DiscountInBaseCurrency: number;
  @IsNumber() AdditionInBaseCurrency: number;
  @IsNumber() TaxInBaseCurrency: number;
  @IsNumber() DutyInBaseCurrency: number;
  @IsNumber() NetPriceInBaseCurrency: number;
  @IsNumber() Duty: number;
  @IsNumber() PriceInBaseCurrency: number;
  @IsNumber() Rate: number;
  @IsOptional() @IsInt() DeliveryLocationRef?: number;
  @IsInt() Version: number;
  @IsInt() Creator: number;
  @IsDate() CreationDate: Date;
  @IsInt() LastModifier: number;
  @IsDate() LastModificationDate: Date;
  @IsBoolean() Closed: boolean;
  @IsOptional() @IsInt() ReceiptRef?: number;
  @IsOptional() @IsInt() PaymentRef?: number;
  @IsString() CustomerRealName: string;
  @IsString() CustomerRealName_En: string;
  @IsOptional() @IsString() Guid?: string;
  @IsNumber() AdditionFactor_VatEffective: number;
  @IsNumber() AdditionFactorInBaseCurrency_VatEffective: number;
  @IsNumber() AdditionFactor_VatIneffective: number;
  @IsNumber() AdditionFactorInBaseCurrency_VatIneffective: number;
}
