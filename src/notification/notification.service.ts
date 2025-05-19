import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/users.entity';
import { Roles } from 'src/common/decorators/roles.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(data: Partial<Notification>, user: User) {
    const notification = this.notificationRepo.create(data);
    notification.fromUser = data?.fromUser!;
    notification.fromUser = user;
    return await this.notificationRepo.save(notification);
  }

  async markAsRead(id: number) {
    const notification = await this.notificationRepo.find({
      where: { id: id },
    });
    if (!notification) throw new NotFoundException('اعلان موجود نیست');
    return await this.notificationRepo.update(id, { receiverRead: true });
  }

  async markAsUnread(id: number) {
    const notification = await this.notificationRepo.find({
      where: { id: id },
    });
    if (!notification) throw new NotFoundException('اعلان موجود نیست');
    return await this.notificationRepo.update(id, { receiverRead: false });
  }

  async getUnreadNotifications(userId: number) {
    const notification = await this.notificationRepo.find({
      where: {
        toUser: { id: userId },
        receiverDelete: false,
        receiverRead: false,
      },
      order: { createdAt: 'DESC' },
    });
    if (!notification) throw new NotFoundException('اعلان موجود نیست');
    return notification;
  }

  async getNotificationById(id: number) {
    const notification = await this.notificationRepo.find({
      where: { id: id },
    });
    if (!notification) throw new NotFoundException('اعلان موجود نیست');
    return notification;
  }

  async getUserRcv(userId: number): Promise<Notification[] | null> {
    const notification = await this.notificationRepo.find({
      where: { toUser: { id: userId }, receiverDelete: false },
      order: { createdAt: 'DESC' },
    });
    if (!notification) throw new NotFoundException('اعلان موجود نیست');
    return notification;
  }

  async getUserSent(userId: number): Promise<Notification[] | null> {
    const notification = await this.notificationRepo.find({
      where: { fromUser: { id: userId }, senderDelete: false },
      order: { createdAt: 'DESC' },
    });
    if (!notification) throw new NotFoundException('اعلان موجود نیست');
    return notification;
  }

  async softDeleteByUser(id: number, user: User) {
    const notif = await this.notificationRepo.findOne({ where: { id: id } });
    if (!notif) throw new NotFoundException('این اعلان وجود ندارد');

    if (notif.toUser.id === user.id) notif.receiverDelete = true;
    else if (notif.fromUser.id === user.id) notif.senderDelete = true;
    else if (user.role === Roles.Admin) {
      notif.receiverDelete = true;
      notif.senderDelete = true;
    } else throw new ForbiddenException('شما مجاز به حذف این اعلان نیستید');

    if (notif.senderDelete && notif.receiverDelete) {
      await this.notificationRepo.delete(id);
      return 'اعلان به طور کامل حذف شد';
    }

    await this.notificationRepo.save(notif);
    return 'اعلان برای شما حذف شد';
  }
}
