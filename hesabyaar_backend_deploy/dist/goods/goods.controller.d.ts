import { Request } from 'express';
import { GoodsService } from './goods.service';
import { Good } from './good.entity';
export declare class GoodsController {
    private readonly goodsService;
    constructor(goodsService: GoodsService);
    create(data: Partial<Good>, req: Request): Promise<Good>;
    getAll(page: number | undefined, limit: number | undefined, search: string): Promise<{
        total: number;
        items: Good[];
    }>;
    getGood(id: number): Promise<Good | null>;
    updateGood(id: number, data: Partial<Good>): Promise<Good | null>;
    deleteGood(id: number): Promise<void>;
    uploadExcel(req: Request, file: Express.Multer.File): Promise<{
        message: string;
        rows: number;
    }>;
}
