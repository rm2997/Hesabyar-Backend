import { Customer } from './customer.entity';
import { DataSource, Repository } from 'typeorm';
export declare class CustomerService {
    private readonly customerRepository;
    private readonly dataSource;
    constructor(customerRepository: Repository<Customer>, dataSource: DataSource);
    createCustomer(data: Partial<Customer>, user: number): Promise<Customer>;
    getAllCustomers(page: number, limit: number, search: string): Promise<{
        total: number;
        items: Customer[];
    }>;
    getCustomerById(id: number): Promise<Customer | null>;
    updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | null>;
    deleteCustomer(id: number): Promise<void>;
}
