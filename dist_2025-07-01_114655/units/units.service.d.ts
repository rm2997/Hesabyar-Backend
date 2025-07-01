import { DataSource, Repository } from 'typeorm';
import { Unit } from './unit.entity';
export declare class UnitsService {
    private readonly unitRepository;
    private readonly dataSource;
    constructor(unitRepository: Repository<Unit>, dataSource: DataSource);
    createUnit(data: Partial<Unit>, user: number): Promise<Unit>;
    getAllUnits(page: number, limit: number, search: string): Promise<{
        total: number;
        items: Unit[];
    }>;
    getUnitById(id: number): Promise<Unit | null>;
    updateUnit(id: number, data: Partial<Unit>): Promise<Unit | null>;
    deleteUnit(id: number): Promise<void>;
}
