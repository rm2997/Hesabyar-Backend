import { Request } from 'express';
import { Unit } from './unit.entity';
import { UnitsService } from './units.service';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    create(data: Partial<Unit>, req: Request): Promise<Unit>;
    getAll(page: number | undefined, limit: number | undefined, serach: string): Promise<{
        total: number;
        items: Unit[];
    }>;
    getUnit(id: number): Promise<Unit | null>;
    updateUnit(id: number, data: Partial<Unit>): Promise<Unit | null>;
    deleteUnit(id: number): Promise<void>;
}
