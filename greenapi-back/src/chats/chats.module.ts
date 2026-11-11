import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenApiModule } from '../green-api/green-api.module.js';
import { InstancesModule } from '../instances/instances.module.js';
import { Chat } from './chat.entity.js';
import { ChatsController } from './chats.controller.js';
import { ChatsService } from './chats.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Chat]), GreenApiModule, InstancesModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
