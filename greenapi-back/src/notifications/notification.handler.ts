import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../chats/chat.entity.js';
import { toChatView } from '../chats/chats.service.js';
import { EventBusService } from '../events/event-bus.service.js';
import type {
  IncomingMessageReceived,
  MessageData,
  NotificationBody,
  OutgoingMessageReceived,
} from '../green-api/green-api.types.js';
import { InstancesService } from '../instances/instances.service.js';
import { Message, type MessageDirection } from '../messages/message.entity.js';
import { MessagesService, toMessageView } from '../messages/messages.service.js';

/**
 * Turns one GREEN-API notification into database rows. Idempotent: the same
 * notification handled twice (redelivered because its delete failed) adds
 * nothing the second time, thanks to the unique (chat, idMessage) key.
 */
@Injectable()
export class NotificationHandler {
  private readonly logger = new Logger(NotificationHandler.name);

  constructor(
    @InjectRepository(Chat) private readonly chats: Repository<Chat>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    private readonly messagesService: MessagesService,
    private readonly instances: InstancesService,
    private readonly bus: EventBusService,
  ) {}

  async handle(instanceId: string, body: NotificationBody): Promise<void> {
    switch (body.typeWebhook) {
      case 'incomingMessageReceived':
        return this.storeMessage(instanceId, body, 'incoming');
      case 'outgoingMessageReceived':
        // Typed in the Telegram app itself: stored so the conversation stays complete.
        return this.storeMessage(instanceId, body, 'outgoing');
      case 'stateInstanceChanged':
        await this.instances.setState(instanceId, body.stateInstance);
        this.logger.log(`Instance state changed to ${body.stateInstance}`);
        this.bus.emit(instanceId, 'instance.state', { state: body.stateInstance });
        return;
      default:
        this.logger.debug(`Ignored notification ${body.originalType || '(no type)'}`);
    }
  }

  private async storeMessage(
    instanceId: string,
    body: IncomingMessageReceived | OutgoingMessageReceived,
    direction: MessageDirection,
  ): Promise<void> {
    const { senderData, messageData } = body;
    const text = textOf(messageData);
    if (text === null) {
      this.logger.debug(`Ignored non-text message (${messageData.typeMessage})`);
      return;
    }
    // Personal chats only: groups have chatType "group" and negative ids in Telegram.
    const chatId = String(senderData.chatId ?? '');
    const isPersonal =
      (senderData.chatType === undefined || senderData.chatType === 'user') &&
      /^\d+$/.test(chatId);
    if (!isPersonal) {
      this.logger.debug(`Ignored message from non-personal chat (${senderData.chatType ?? '?'})`);
      return;
    }

    const { chat, created } = await this.findOrCreateChat(instanceId, body, direction);
    const sentAt = new Date(body.timestamp * 1000);

    const inserted = await this.messages
      .createQueryBuilder()
      .insert()
      .values({ chatId: chat.id, idMessage: body.idMessage, direction, text, sentAt })
      .orIgnore()
      .returning('id')
      .execute();
    const rows = inserted.raw as { id: string }[];
    if (rows.length === 0) return; // already stored: no events either

    await this.messagesService.bumpLastMessageAt(chat.id, sentAt);
    this.logger.log(`Stored ${direction} message in chat ${chat.id}`);

    // chat.created goes first and already carries the message, so a client can render the new chat whole.
    if (created) {
      const lastMessageAt =
        chat.lastMessageAt && chat.lastMessageAt > sentAt ? chat.lastMessageAt : sentAt;
      this.bus.emit(instanceId, 'chat.created', { ...toChatView(chat, text), lastMessageAt });
    }
    const message = Object.assign(new Message(), { id: rows[0].id, direction, text, sentAt });
    this.bus.emit(instanceId, 'message.created', { chatId: chat.id, message: toMessageView(message) });
  }

  /** The chat for the notification's chatId; a message from a new sender creates one. */
  private async findOrCreateChat(
    instanceId: string,
    body: IncomingMessageReceived | OutgoingMessageReceived,
    direction: MessageDirection,
  ): Promise<{ chat: Chat; created: boolean }> {
    const { senderData } = body;
    const chatId = String(senderData.chatId);
    const name = senderData.chatName || (direction === 'incoming' ? senderData.senderName : '') || null;
    // On outgoing notifications the sender is this instance itself, so its phone is not the chat's.
    const phone =
      direction === 'incoming' ? String(senderData.senderPhoneNumber ?? '').replace(/\D/g, '') : '';
    const phoneNumber = phone && Number(phone) !== 0 ? phone : null;

    const result = await this.chats
      .createQueryBuilder()
      .insert()
      .values({ instanceId, chatId, name, phoneNumber })
      .orIgnore()
      .returning('id')
      .execute();
    const chat = await this.chats.findOneByOrFail({ instanceId, chatId });
    if ((result.raw as unknown[]).length > 0) {
      this.logger.log(`New chat ${chat.id} created from an ${direction} message`);
      return { chat, created: true };
    }

    // Existing chat: fill in what it was missing.
    const patch: Partial<Chat> = {};
    if (!chat.name && name) patch.name = name;
    if (!chat.phoneNumber && phoneNumber) patch.phoneNumber = phoneNumber;
    if (Object.keys(patch).length > 0) {
      await this.chats.update({ id: chat.id }, patch);
      Object.assign(chat, patch);
    }
    return { chat, created: false };
  }
}

/** The text of a text message, or null for anything else (media, stickers, ...). */
function textOf(data: MessageData): string | null {
  if (data.typeMessage === 'textMessage') return data.textMessageData?.textMessage ?? null;
  if (data.typeMessage === 'extendedTextMessage') return data.extendedTextMessageData?.text ?? null;
  return null;
}
