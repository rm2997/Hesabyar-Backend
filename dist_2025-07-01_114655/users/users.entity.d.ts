import { Notification } from 'src/notification/notification.entity';
import { Roles } from 'src/common/decorators/roles.enum';
import { Customer } from 'src/customer/customer.entity';
import { Good } from 'src/goods/good.entity';
import { Proforma } from 'src/proforma/proforma.entity';
import { Invoice } from 'src/invoice/invoice.entity';
export declare class User {
    id: number;
    username: string;
    password: string;
    role: Roles;
    userfname: string;
    userlname: string;
    usermobilenumber: string;
    createdAt: Date;
    createdBy: number;
    userLocation: string;
    lastLogin: Date;
    twoFactorAuthntication: boolean;
    userAcceptedProforma: Proforma[];
    userConvertedProforma: Proforma[];
    userAcceptedInvoice: Invoice[];
    usernotifications: Notification[];
    assignednotifications: Notification[];
    customers: Customer[];
    goods: Good[];
}
