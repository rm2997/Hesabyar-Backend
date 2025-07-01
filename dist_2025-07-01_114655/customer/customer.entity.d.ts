import { User } from 'src/users/users.entity';
export declare class Customer {
    id: number;
    customerGender: string;
    customerFName: string;
    customerLName: string;
    customerAddress: string;
    customerPhone: string;
    customerMobile: string;
    customerNationalCode: string;
    customerPostalCode: string;
    createdAt: Date;
    createdBy: User;
}
