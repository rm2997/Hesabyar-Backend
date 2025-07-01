import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Invoice } from './invoice.entity';
export declare class InvoiceGoods {
    id: number;
    quantity: number;
    price: number;
    total: number;
    invoice: Invoice[];
    good: Good[];
    createdAt: Date;
    createdBy: User;
}
