import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import type { Response } from 'express';
import type { Instance } from '../instances/instance.entity.js';
import { ChatsService, toChatView, type ChatView } from './chats.service.js';
import { createChatSchema, type CreateChatDto } from './create-chat.schema.js';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  list(@CurrentUser() instance: Instance): Promise<ChatView[]> {
    return this.chats.list(instance.id);
  }

  /** 201 for a new chat, 200 when the chat already existed. */
  @Post()
  async create(
    @CurrentUser() instance: Instance,
    @Body({ schema: createChatSchema }) dto: CreateChatDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ChatView> {
    const { chat, created } = await this.chats.createByPhone(instance.id, dto.phoneNumber);
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return toChatView(chat);
  }
}
