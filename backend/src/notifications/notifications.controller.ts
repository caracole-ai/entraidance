import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('users/me/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findByUser(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _dto: UpdateNotificationDto,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
