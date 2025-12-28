import { IsBoolean, IsDate, IsInt, IsString } from 'class-validator';

export class SepidarInventoryDeliveryDto {
  @IsInt() InventoryDeliveryID: number;
  @IsBoolean() IsReturn: boolean;
  @IsInt() StockRef: number;
  @IsInt() ReceiverDLRef: number;
  @IsInt() AccountingVoucherRef?: number;
  @IsInt() FiscalYearRef: number;
  @IsInt() Creator: number;
  @IsDate() CreationDate: Date;
  @IsInt() LastModifier: number;
  @IsDate() LastModificationDate: Date;
  @IsInt() Version: number;
  @IsInt() CreatorForm: number;
  @IsInt() DestinationStockRef?: number;
  @IsString() Description?: string;
  @IsInt() Number: number;
  @IsDate() Date: Date;
  @IsInt() Type: number;
  @IsInt() TotalPrice: number;
}
