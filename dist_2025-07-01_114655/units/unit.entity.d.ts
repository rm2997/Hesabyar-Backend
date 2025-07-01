import { Good } from 'src/goods/good.entity';
import { User } from 'src/users/users.entity';
export declare class Unit {
    id: number;
    unitName: string;
    unitInfo: string;
    createdAt: Date;
    updateAt: Date;
    sepidarId: string;
    goods: Good[];
    createdBy: User;
}
