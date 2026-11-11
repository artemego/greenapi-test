import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreenApiClient } from '../green-api/green-api.client.js';
import { toHttpError } from '../green-api/green-api-http-error.js';
import { InstancesService } from '../instances/instances.service.js';
import { Chat } from './chat.entity.js';

export interface ChatView {
  id: string;
  chatId: string;
  phoneNumber: string | null;
  name: string | null;
  lastMessageAt: Date | null;
  lastMessage: string | null;
}

export function toChatView(chat: Chat, lastMessage: string | null = null): ChatView {
  return {
    id: chat.id,
    chatId: chat.chatId,
    phoneNumber: chat.phoneNumber,
    name: chat.name,
    lastMessageAt: chat.lastMessageAt,
    lastMessage,
  };
}

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    @InjectRepository(Chat) private readonly repo: Repository<Chat>,
    private readonly greenApi: GreenApiClient,
    private readonly instances: InstancesService,
  ) {}

  /** Chats of the instance, most recent conversation first. */
  async list(instanceId: string): Promise<ChatView[]> {
    const chats = await this.repo
      .createQueryBuilder('chat')
      .where('chat.instanceId = :instanceId', { instanceId })
      .orderBy('chat.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('chat.createdAt', 'DESC')
      .getMany();
    const lastTexts = await this.lastMessageTexts(chats.map((chat) => chat.id));
    return chats.map((chat) => toChatView(chat, lastTexts.get(chat.id) ?? null));
  }

  /**
   * Latest message text per chat, in one query (Postgres DISTINCT ON). Uses
   * the table name rather than the Message entity so this module does not
   * depend on the messages module, which depends on this one.
   */
  private async lastMessageTexts(chatIds: string[]): Promise<Map<string, string>> {
    if (chatIds.length === 0) return new Map();
    const rows = await this.repo.manager
      .createQueryBuilder()
      .select('m."chatId"', 'chatId')
      .addSelect('m.text', 'text')
      .distinctOn(['m."chatId"'])
      .from('messages', 'm')
      .where('m."chatId" IN (:...chatIds)', { chatIds })
      .orderBy('m."chatId"')
      .addOrderBy('m."sentAt"', 'DESC')
      .addOrderBy('m."createdAt"', 'DESC')
      .getRawMany<{ chatId: string; text: string }>();
    return new Map(rows.map((row) => [row.chatId, row.text]));
  }

  /**
   * Finds or creates the chat for a phone number (digits only). A phone that
   * already has a chat never reaches GREEN-API: `checkAccount` is rate limited.
   */
  async createByPhone(
    instanceId: string,
    phoneNumber: string,
  ): Promise<{ chat: Chat; created: boolean }> {
    const known = await this.repo.findOneBy({ instanceId, phoneNumber });
    if (known) return { chat: known, created: false };

    const creds = await this.instances.findWithToken(instanceId);
    if (!creds) throw new UnauthorizedException();

    const account = await this.greenApi
      .checkAccount(creds, phoneNumber)
      .catch(toHttpError);
    if (!account.exist) {
      throw new NotFoundException(
        'No Telegram account for this number, or the number is hidden by privacy settings',
      );
    }
    if (account.chatId === undefined || account.chatId === null) {
      this.logger.warn('checkAccount returned exist: true without a chatId');
      throw new BadGatewayException('GREEN-API returned no chatId for this number');
    }
    const chatId = String(account.chatId);

    // The chat may already exist without a phone (it started with an incoming message).
    const byChatId = await this.repo.findOneBy({ instanceId, chatId });
    if (byChatId) {
      if (!byChatId.phoneNumber) {
        byChatId.phoneNumber = phoneNumber;
        await this.repo.save(byChatId);
      }
      return { chat: byChatId, created: false };
    }

    // orIgnore: a concurrent request for the same chat may have inserted it first.
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .values({ instanceId, chatId, phoneNumber, name: account.username || null })
      .orIgnore()
      .returning('id')
      .execute();
    const chat = await this.repo.findOneByOrFail({ instanceId, chatId });
    return { chat, created: (result.raw as unknown[]).length > 0 };
  }

  /** A chat of this instance, or 404 (also for chats of other instances). */
  async findOwned(instanceId: string, id: string): Promise<Chat> {
    const chat = await this.repo.findOneBy({ instanceId, id });
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }
}
