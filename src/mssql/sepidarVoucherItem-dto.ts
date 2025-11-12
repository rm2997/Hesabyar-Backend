import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class SepidarVoucherItemDTO {
  @IsInt() VoucherItemId: number;
  @IsInt() VoucherRef: number;
  @IsNumber() RowNumber: number;
  @IsInt() AccountSLRef: number;
  @IsInt() DLRef: number;
  @IsString() Description: string;
  @IsString() Description_En: string;
  @IsNumber() Debit: number;
  @IsNumber() Credit: number;
  @IsInt() CurrencyRef: number;
  @IsNumber() TrackingNumber: number;
  @IsDate() TrackingDate: Date;
  @IsNumber() CurrencyDebit: number;
  @IsNumber() CurrencyCredit: number;
  @IsString() IssuerEntityName: string;
  @IsNumber() CurrencyRate: number;
  @IsInt() IssuerEntityRef: number;
  @IsNumber() Version: number;
}
