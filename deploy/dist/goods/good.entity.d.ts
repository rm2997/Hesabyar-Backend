import { InvoiceGoods } from 'src/invoice/invoice-good.entity';
import { ProformaGoods } from 'src/proforma/proforma-goods.entity';
import { Unit } from 'src/units/unit.entity';
import { User } from 'src/users/users.entity';
export declare class Good {
    id: number;
    goodName: string;
    goodPrice: number;
    goodInfo: string;
    createdAt: Date;
    updatedAt: Date;
    sepidarId: string;
    goodInvoice: InvoiceGoods[];
    goodProforma: ProformaGoods[];
    goodUnit: Unit;
    createdBy: User;
    good: {
        id: number;
    };
}
