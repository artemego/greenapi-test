import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import type { Instance } from '../instances/instance.entity.js';
import { MessagesService, type MessageView } from './messages.service.js';
import {
  chatIdParamSchema,
  historyQuerySchema,
  sendMessageSchema,
  type HistoryQuery,
  type SendMessageDto,
} from './messages.schemas.js';

@Controller('chats/:id/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  history(
    @CurrentUser() instance: Instance,
    @Param('id', { schema: chatIdParamSchema }) chatId: string,
    @Query({ schema: historyQuerySchema }) query: HistoryQuery,
  ): Promise<MessageView[]> {
    return this.messages.history(instance.id, chatId, query);
  }

  @Post()
  send(
    @CurrentUser() instance: Instance,
    @Param('id', { schema: chatIdParamSchema }) chatId: string,
    @Body({ schema: sendMessageSchema }) dto: SendMessageDto,
  ): Promise<MessageView> {
    return this.messages.send(instance.id, chatId, dto.text);
  }
}
