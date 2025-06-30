import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { Proforma } from './proforma.entity';
export declare class ProformaGoods {
    id: number;
    quantity: number;
    price: number;
    total: number;
    proforma: Proforma[];
    good: Good[];
    description: string;
    createdAt: Date;
    createdBy: User;
}
