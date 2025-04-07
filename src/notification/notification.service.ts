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

  async createNotification(user: User, message: string) {
    const notification = this.notificationRepo.create({ user, message });
    return this.notificationRepo.save(notification);
  }

  async markAsRead(id: number) {
    return this.notificationRepo.update(id, { read: true });
  }

  async getUnreadNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { user: { id: userId }, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
