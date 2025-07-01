import { DataSource, Repository } from 'typeorm';
import { Good } from './good.entity';
import { UnitsService } from 'src/units/units.service';
import { User } from 'src/users/users.entity';
export declare class GoodsService {
    private readonly goodRepository;
    private readonly unitService;
    private readonly dataSource;
    constructor(goodRepository: Repository<Good>, unitService: UnitsService, dataSource: DataSource);
    createGood(data: Partial<Good>, user: number): Promise<Good>;
    createGoodFromExcelFile(data: any[], user: User): Promise<{
        message: string;
        rows: number;
    }>;
    getAllGoods(page: number, limit: number, search: string): Promise<{
        total: number;
        items: Good[];
    }>;
    getGoodsByCount(count: number): Promise<Good[]>;
    getGoodById(id: number): Promise<Good | null>;
    updateGood(id: number, data: Partial<Good>): Promise<Good | null>;
    deleteGood(id: number): Promise<void>;
}
