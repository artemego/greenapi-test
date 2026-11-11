import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../chats/chat.entity.js';
import { ChatsModule } from '../chats/chats.module.js';
import { GreenApiModule } from '../green-api/green-api.module.js';
import { InstancesModule } from '../instances/instances.module.js';
import { Message } from './message.entity.js';
import { MessagesController } from './messages.controller.js';
import { MessagesService } from './messages.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Chat]),
    ChatsModule,
    GreenApiModule,
    InstancesModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
