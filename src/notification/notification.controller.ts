import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Request } from 'express';
import { User } from 'src/users/users.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() data: Partial<Notification>, @Req() req: Request) {
    const fromUser = req.user as User;

    return this.notificationService.createNotification(data, fromUser);
  }

  @Get('/unread')
  async getUnread(@Req() req: Request) {
    const user = req['user'];
    return this.notificationService.getUnreadNotifications(user!.id);
  }

  @Get('/received')
  async getAllRec(@Req() req: Request) {
    const user = req['user'];
    const notifications = await this.notificationService.getUserRcv(user!.id);

    if (notifications) return notifications;
    else return null;
  }

  @Get('/sent')
  async getAllSnd(@Req() req: Request) {
    const user = req['user'];
    const notifications = await this.notificationService.getUserSent(user!.id);
    if (notifications) return notifications;
    else return null;
  }

  @Get('/:id')
  async getNotification(@Param('id') id: string) {
    return this.notificationService.getNotificationById(+id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(+id);
  }

  @Patch(':id/unread')
  async markAsUnread(@Param('id') id: string) {
    return this.notificationService.markAsUnread(+id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as User;
    return await this.notificationService.softDeleteByUser(id, user);
  }
}
