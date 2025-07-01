import { User } from 'src/users/users.entity';
export declare class Notification {
    id: number;
    title: string;
    message: string;
    senderRead: boolean;
    receiverRead: boolean;
    senderDelete: boolean;
    receiverDelete: boolean;
    createdAt: Date;
    fromUser: User;
    toUser: User;
}
