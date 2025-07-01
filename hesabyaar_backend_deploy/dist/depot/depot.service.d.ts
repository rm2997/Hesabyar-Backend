import { Repository } from 'typeorm';
import { Depot } from './depot.entity';
export declare class DepotService {
    private readonly depotRepository;
    constructor(depotRepository: Repository<Depot>);
    createDepot(data: Partial<Depot>, user: number): Promise<Depot>;
    getAllDepots(): Promise<Depot[]>;
    getDepotById(id: number): Promise<Depot | null>;
    updateDepot(id: number, data: Partial<Depot>): Promise<Depot | null>;
    deleteDepot(id: number): Promise<void>;
}
