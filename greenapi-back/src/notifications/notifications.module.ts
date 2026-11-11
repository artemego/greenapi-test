import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../chats/chat.entity.js';
import { GreenApiModule } from '../green-api/green-api.module.js';
import { InstancesModule } from '../instances/instances.module.js';
import { Message } from '../messages/message.entity.js';
import { MessagesModule } from '../messages/messages.module.js';
import { NotificationHandler } from './notification.handler.js';
import { NotificationPollerService } from './notification-poller.service.js';
import { NotificationSettingsService } from './notification-settings.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message]),
    GreenApiModule,
    InstancesModule,
    MessagesModule,
  ],
  providers: [NotificationHandler, NotificationPollerService, NotificationSettingsService],
  exports: [NotificationPollerService, NotificationSettingsService],
})
export class NotificationsModule {}
