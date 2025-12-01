import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class SepidarInvoiceItemDTO {
  @IsInt() InvoiceItemId: number;
  @IsInt() InvoiceRef: number;
  @IsInt() ItemRef: number;
  @IsInt() StockRef: number;
  @IsOptional() @IsInt() TracingRef?: number;
  @IsNumber() Quantity: number;
  @IsOptional() @IsNumber() SecondaryQuantity?: number;
  @IsNumber() Fee: number;
  @IsNumber() Price: number;
  @IsNumber() PriceInBaseCurrency: number;
  @IsNumber() DiscountInBaseCurrency: number;
  @IsNumber() AdditionInBaseCurrency: number;
  @IsNumber() TaxInBaseCurrency: number;
  @IsNumber() DutyInBaseCurrency: number;
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
  @IsInt() QuotationItemRef?: number;
  @IsNumber() CustomerDiscountRate: number;
  @IsNumber() PriceInfoDiscountRate: number;
  @IsOptional() @IsString() Description?: string;
  @IsOptional() @IsString() Description_En?: string;
  @IsOptional() @IsInt() DiscountInvoiceItemRef?: number;
  @IsNumber() PriceInfoPriceDiscount: number;
  @IsNumber() PriceInfoPercentDiscount: number;
  @IsNumber() CustomerDiscount: number;
  @IsOptional() @IsInt() OrderItemRef?: number;
  @IsOptional() @IsInt() ProductPackRef?: number;
  @IsOptional() @IsNumber() ProductPackQuantity?: number;
  @IsNumber() AggregateAmountPercentDiscount: number;
  @IsOptional() @IsInt() DiscountItemGroupRef?: number;
  @IsNumber() BankFeeForCurrencySale: number;
  @IsNumber() BankFeeForCurrencySaleInBaseCurrency: number;
  @IsBoolean() IsAggregateDiscountInvoiceItem: boolean;
  @IsNumber() TaxPayerCurrencyPurchaseRate: number;
  @IsInt() RowID: number;
  @IsNumber() AggregateAmountPriceDiscount: number;
  @IsNumber() AggregateAmountDiscountRate: number;
}
