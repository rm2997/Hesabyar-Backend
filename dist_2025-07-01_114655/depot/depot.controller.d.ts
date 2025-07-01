import { Request } from 'express';
import { DepotService } from './depot.service';
import { Depot } from './depot.entity';
export declare class DepotController {
    private readonly depotService;
    constructor(depotService: DepotService);
    create(data: Partial<Depot>, req: Request): Promise<Depot>;
    getAll(): Promise<Depot[]>;
    getDepot(id: number): Promise<Depot | null>;
    updateDepot(id: number, data: Partial<Depot>): Promise<Depot | null>;
    deleteDepot(id: number): Promise<void>;
}
