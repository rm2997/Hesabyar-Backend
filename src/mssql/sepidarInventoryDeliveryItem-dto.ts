import { IsBoolean, IsInt, IsString } from 'class-validator';

export class SepidarInventoryDeliveryItemDto {
  @IsInt() InventoryDeliveryItemID: number;
  @IsInt() ProductOrderRef?: number;
  ParityCheck?: string;
  @IsInt() QuotationItemRef?: number;
  @IsInt() WeighingRef?: number;
  @IsInt() ItemRequestItemRef?: number;
  @IsString() ItemDescription?: string;
  @IsInt() InventoryDeliveryRef: number;
  @IsBoolean() IsReturn: boolean;
  RowNumber: number;
  @IsInt() BaseInvoiceItem?: number;
  @IsInt() ItemRef: number;
  @IsInt() TracingRef?: number;
  @IsInt() Quantity: number;
  @IsInt() SecondaryQuantity?: number;
  @IsInt() SLAccountRef?: number;
  @IsInt() Price?: number;
  @IsString() Description?: string;
  @IsInt() Version: number;
  @IsString() Description_En?: string;
}
