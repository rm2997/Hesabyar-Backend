import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsNumber,
  isNumber,
} from 'class-validator';

export class SepidarVoucherDTO {
  @IsInt() VoucherId: number;
  @IsNumber() Number: number;
  @IsInt() FiscalYearRef: number;
  @IsInt() ReferenceNumber: number;
  @IsNumber() SecondaryNumber: number;
  @IsDate() Date: Date;
  @IsNumber() DailyNumber: number;
  @IsNumber() Type: number;
  @IsBoolean() State: boolean;
  @IsString() Description: string;
  @IsString() Description_En: string;
  @IsNumber() Version: number;
  @IsInt() Creator: number;
  @IsDate() CreationDate: Date;
  @IsInt() LastModifier: number;
  @IsDate() LastModificationDate: Date;
  @IsNumber() IssuerSystem: number;
  @IsBoolean() IsMerged: boolean;
  @IsNumber() MergedIssuerSystem: number;
}
