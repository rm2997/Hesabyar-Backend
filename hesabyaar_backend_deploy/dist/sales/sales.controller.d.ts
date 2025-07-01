import { Request } from 'express';
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(data: Partial<Sale>, req: Request): Promise<Sale>;
    getAll(): Promise<Sale[]>;
    getSale(id: number): Promise<Sale | null>;
    updateSale(id: number, data: Partial<Sale>): Promise<Sale | null>;
    deleteSale(id: number): Promise<void>;
}
