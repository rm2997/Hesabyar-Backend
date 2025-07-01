import { DataSource, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/users.entity';
export declare class NotificationService {
    private notificationRepo;
    private readonly dataSource;
    constructor(notificationRepo: Repository<Notification>, dataSource: DataSource);
    createNotification(data: Partial<Notification>, user: User): Promise<Notification>;
    markAsRead(id: number): Promise<import("typeorm").UpdateResult>;
    markAsUnread(id: number): Promise<import("typeorm").UpdateResult>;
    getUnreadNotifications(userId: number): Promise<Notification[]>;
    getNotificationById(id: number): Promise<Notification[]>;
    getUserRcv(page: number, limit: number, search: string, userId: number): Promise<{
        total: number;
        items: Notification[];
    }>;
    getUserSent(page: number, limit: number, search: string, userId: number): Promise<{
        items: Notification[];
        total: number;
    }>;
    softDeleteByUser(id: number, user: User): Promise<"اعلان به طور کامل حذف شد" | "اعلان برای شما حذف شد">;
}
