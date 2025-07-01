import { Invoice } from 'src/invoice/invoice.entity';
import { User } from 'src/users/users.entity';
export declare class Sale {
    id: number;
    invoice: Invoice;
    saleInfo: string;
    createdAt: Date;
    createdBy: User;
}
