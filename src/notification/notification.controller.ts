import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/auth/jwt-admin.guard';
import { NotificationService } from './notification.service';

@ApiTags('Notifications — Admin')
@ApiBearerAuth()
@UseGuards(JwtAdminGuard)
@Controller('admin/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Toutes les notifications admin' })
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @ApiOperation({ summary: 'Notifications non lues' })
  @Get('unread')
  findUnread() {
    return this.notificationService.findUnread();
  }

  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  @Get('count')
  countUnread() {
    return this.notificationService.countUnread();
  }

  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @Patch('read-all')
  markAllAsRead() {
    return this.notificationService.markAllAsRead();
  }

  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
