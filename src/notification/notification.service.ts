import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/users.entity';
import { Roles } from 'src/common/decorators/roles.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private readonly dataSource: DataSource,
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

  async getUserRcv(
    page: number,
    limit: number,
    search: string,
    userId: number,
  ): Promise<{ total: number; items: Notification[] }> {
    const query = this.dataSource
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.fromUser', 'user')
      .andWhere(`notification.toUser= :user`, { user: userId });

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

  async getUserSent(
    page: number,
    limit: number,
    search: string,
    userId: number,
  ): Promise<{ items: Notification[]; total: number }> {
    const query = this.dataSource
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.toUser', 'user')
      .andWhere(`notification.fromUser= :user`, { user: userId });

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
