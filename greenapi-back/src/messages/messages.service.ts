import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Chat } from '../chats/chat.entity.js';
import { ChatsService } from '../chats/chats.service.js';
import { GreenApiClient } from '../green-api/green-api.client.js';
import { toHttpError } from '../green-api/green-api-http-error.js';
import { InstancesService } from '../instances/instances.service.js';
import { Message, type MessageDirection } from './message.entity.js';
import type { HistoryQuery } from './messages.schemas.js';

export interface MessageView {
  id: string;
  direction: MessageDirection;
  text: string;
  sentAt: Date;
}

export function toMessageView(message: Message): MessageView {
  return {
    id: message.id,
    direction: message.direction,
    text: message.text,
    sentAt: message.sentAt,
  };
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly repo: Repository<Message>,
    @InjectRepository(Chat) private readonly chatsRepo: Repository<Chat>,
    private readonly chats: ChatsService,
    private readonly instances: InstancesService,
    private readonly greenApi: GreenApiClient,
  ) {}

  /** One page of history, returned oldest first. */
  async history(
    instanceId: string,
    chatId: string,
    { limit, before }: HistoryQuery,
  ): Promise<MessageView[]> {
    const chat = await this.chats.findOwned(instanceId, chatId);
    const newestFirst = await this.repo.find({
      where: { chatId: chat.id, ...(before ? { sentAt: LessThan(before) } : {}) },
      order: { sentAt: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
    return newestFirst.reverse().map(toMessageView);
  }

  /**
   * Sends through GREEN-API first and stores the message only if that worked,
   * so the history never shows a message that was not sent.
   */
  async send(instanceId: string, chatId: string, text: string): Promise<MessageView> {
    const chat = await this.chats.findOwned(instanceId, chatId);
    const creds = await this.instances.findWithToken(instanceId);
    if (!creds) throw new UnauthorizedException();

    const { idMessage } = await this.greenApi
      .sendMessage(creds, chat.chatId, text)
      .catch(toHttpError);

    const message = await this.repo.save(
      this.repo.create({
        chatId: chat.id,
        idMessage,
        direction: 'outgoing',
        text,
        sentAt: new Date(),
      }),
    );
    await this.bumpLastMessageAt(chat.id, message.sentAt);
    // TODO(step 7): emit `message.created` so other open tabs update.
    return toMessageView(message);
  }

  /** Moves `Chat.lastMessageAt` forward only (messages can be stored out of order). */
  async bumpLastMessageAt(chatId: string, sentAt: Date): Promise<void> {
    await this.chatsRepo
      .createQueryBuilder()
      .update()
      .set({ lastMessageAt: sentAt })
      .where('id = :chatId', { chatId })
      .andWhere('("lastMessageAt" IS NULL OR "lastMessageAt" < :sentAt)', { sentAt })
      .execute();
  }
}
