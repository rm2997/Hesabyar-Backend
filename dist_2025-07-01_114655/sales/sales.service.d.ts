import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
export declare class SalesService {
    private readonly saleRepository;
    constructor(saleRepository: Repository<Sale>);
    createSale(data: Partial<Sale>, user: number): Promise<Sale>;
    getAllSales(): Promise<Sale[]>;
    getSaleById(id: number): Promise<Sale | null>;
    updateSale(id: number, data: Partial<Sale>): Promise<Sale | null>;
    deleteSale(id: number): Promise<void>;
}
