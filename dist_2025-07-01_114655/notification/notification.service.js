"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const roles_enum_1 = require("../common/decorators/roles.enum");
let NotificationService = class NotificationService {
    notificationRepo;
    dataSource;
    constructor(notificationRepo, dataSource) {
        this.notificationRepo = notificationRepo;
        this.dataSource = dataSource;
    }
    async createNotification(data, user) {
        const notification = this.notificationRepo.create(data);
        notification.fromUser = data?.fromUser;
        notification.fromUser = user;
        return await this.notificationRepo.save(notification);
    }
    async markAsRead(id) {
        const notification = await this.notificationRepo.find({
            where: { id: id },
        });
        if (!notification)
            throw new common_1.NotFoundException('اعلان موجود نیست');
        return await this.notificationRepo.update(id, { receiverRead: true });
    }
    async markAsUnread(id) {
        const notification = await this.notificationRepo.find({
            where: { id: id },
        });
        if (!notification)
            throw new common_1.NotFoundException('اعلان موجود نیست');
        return await this.notificationRepo.update(id, { receiverRead: false });
    }
    async getUnreadNotifications(userId) {
        const notification = await this.notificationRepo.find({
            where: {
                toUser: { id: userId },
                receiverDelete: false,
                receiverRead: false,
            },
            order: { createdAt: 'DESC' },
        });
        if (!notification)
            throw new common_1.NotFoundException('اعلان موجود نیست');
        return notification;
    }
    async getNotificationById(id) {
        const notification = await this.notificationRepo.find({
            where: { id: id },
        });
        if (!notification)
            throw new common_1.NotFoundException('اعلان موجود نیست');
        return notification;
    }
    async getUserRcv(page, limit, search, userId) {
        const query = this.dataSource
            .getRepository(notification_entity_1.Notification)
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.fromUser', 'user')
            .andWhere(`notification.toUser= :user`, { user: userId })
            .andWhere('notification.receiverDelete=false');
        if (search) {
            query.andWhere('notification.title LIKE :search', {
                search: `%${search}%`,
            });
        }
        const total = await query.getCount();
        const items = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { total, items };
    }
    async getUserSent(page, limit, search, userId) {
        const query = this.dataSource
            .getRepository(notification_entity_1.Notification)
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.toUser', 'user')
            .andWhere(`notification.fromUser= :user`, { user: userId })
            .andWhere('notification.receiverDelete=false');
        if (search) {
            query.andWhere('notification.title LIKE :search', {
                search: `%${search}%`,
            });
        }
        const total = await query.getCount();
        const items = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { total, items };
    }
    async softDeleteByUser(id, user) {
        const notif = await this.notificationRepo.findOne({ where: { id: id } });
        if (!notif)
            throw new common_1.NotFoundException('این اعلان وجود ندارد');
        if (notif.toUser.id === user.id)
            notif.receiverDelete = true;
        else if (notif.fromUser.id === user.id)
            notif.senderDelete = true;
        else if (user.role === roles_enum_1.Roles.Admin) {
            notif.receiverDelete = true;
            notif.senderDelete = true;
        }
        else
            throw new common_1.ForbiddenException('شما مجاز به حذف این اعلان نیستید');
        if (notif.senderDelete && notif.receiverDelete) {
            await this.notificationRepo.delete(id);
            return 'اعلان به طور کامل حذف شد';
        }
        await this.notificationRepo.save(notif);
        return 'اعلان برای شما حذف شد';
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], NotificationService);
//# sourceMappingURL=notification.service.js.map