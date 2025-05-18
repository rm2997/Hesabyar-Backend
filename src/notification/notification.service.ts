import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/users.entity';

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
    return this.notificationRepo.save(notification);
  }

  async markAsRead(id: number) {
    return this.notificationRepo.update(id, { read: true });
  }

  async markAsUnread(id: number) {
    return this.notificationRepo.update(id, { read: false });
  }

  async getUnreadNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { toUser: { id: userId }, read: false },
      order: { createdAt: 'DESC' },
    });
  }
  async getNotificationById(id: number) {
    return this.notificationRepo.find({
      where: { id: id },
    });
  }

  async getUserRcv(userId: number): Promise<Notification[] | null> {
    return await this.notificationRepo.find({
      where: { toUser: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserSent(userId: number): Promise<Notification[] | null> {
    return await this.notificationRepo.find({
      where: { fromUser: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
