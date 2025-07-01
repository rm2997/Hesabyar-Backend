import { NotificationService } from './notification.service';
import { Request } from 'express';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(data: Partial<Notification>, req: Request): Promise<import("./notification.entity").Notification>;
    getUnread(page: number | undefined, limit: number | undefined, search: string, req: Request): Promise<import("./notification.entity").Notification[]>;
    getAllRec(page: number | undefined, limit: number | undefined, search: string, req: Request): Promise<{
        total: number;
        items: import("./notification.entity").Notification[];
    } | null>;
    getAllSnd(page: number | undefined, limit: number | undefined, search: string, req: Request): Promise<{
        items: import("./notification.entity").Notification[];
        total: number;
    } | null>;
    getNotification(id: string): Promise<import("./notification.entity").Notification[]>;
    markAsRead(id: string): Promise<import("typeorm").UpdateResult>;
    markAsUnread(id: string): Promise<import("typeorm").UpdateResult>;
    delete(id: number, req: Request): Promise<"اعلان به طور کامل حذف شد" | "اعلان برای شما حذف شد">;
}
