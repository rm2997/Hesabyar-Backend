import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';
export class SepidarQuotationItemDTO {
  @IsInt() QuotationItemID: number;
  @IsInt() QuotationRef: number;
  @IsInt() RowID: number;
  @IsInt() ItemRef: number;
  @IsInt() StockRef: number;
  @IsOptional() @IsInt() TracingRef?: number;
  @IsNumber() Quantity: number;
  @IsOptional() @IsNumber() SecondaryQuantity?: number;
  @IsNumber() Fee: number;
  @IsNumber() Price: number;
  @IsNumber() PriceInBaseCurrency: number;
  @IsNumber() NetPriceInBaseCurrency: number;
  @IsNumber() Rate: number;
  @IsNumber() Discount: number;
  @IsNumber() Addition: number;
  @IsNumber() Tax: number;
  @IsNumber() Duty: number;
  @IsNumber() AdditionFactor_VatEffective: number;
  @IsNumber() AdditionFactor_VatIneffective: number;
  @IsNumber() AdditionFactorInBaseCurrency_VatEffective: number;
  @IsNumber() AdditionFactorInBaseCurrency_VatIneffective: number;
  @IsNumber() CustomerDiscountRate: number;
  @IsNumber() PriceInfoDiscountRate: number;
  @IsOptional() @IsString() Description?: string;
  @IsOptional() @IsString() Description_En?: string;
  @IsOptional() @IsInt() DiscountQuotationItemRef?: number;
  @IsNumber() PriceInfoPriceDiscount: number;
  @IsNumber() PriceInfoPercentDiscount: number;
  @IsNumber() CustomerDiscount: number;
  @IsOptional() @IsInt() ProductPackRef?: number;
  @IsOptional() @IsNumber() ProductPackQuantity?: number;
  @IsBoolean() IsAggregateDiscountInvoiceItem: boolean;
  @IsNumber() UsedQuantity: number;
  @IsNumber() AggregateAmountDiscountRate: number;
  @IsNumber() AggregateAmountPriceDiscount: number;
  @IsNumber() AggregateAmountPercentDiscount: number;
}
