import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body('message') message: string, @Req() req: Request) {
    const user = req['user'];
    return this.notificationService.createNotification(user!, message);
  }

  @Get('/unread')
  async getUnread(@Req() req: Request) {
    const user = req['user'];
    return this.notificationService.getUnreadNotifications(user!.id);
  }

  @Get('/all')
  async getAll(@Req() req: Request) {
    const user = req['user'];
    return this.notificationService.getAllNotifications(user!.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(+id);
  }
}
