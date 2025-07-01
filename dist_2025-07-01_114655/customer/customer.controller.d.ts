import { CustomerService } from './customer.service';
import { Request } from 'express';
import { Customer } from './customer.entity';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(data: any, req: Request): Promise<Customer>;
    getAll(page: number | undefined, limit: number | undefined, search: string): Promise<{
        total: number;
        items: Customer[];
    }>;
    getCustomer(id: number): Promise<Customer | null>;
    updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | null>;
    deleteCustomer(id: number): Promise<void>;
}
