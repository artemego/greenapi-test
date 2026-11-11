import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Chat } from '../chats/chat.entity.js';

export type MessageDirection = 'incoming' | 'outgoing';

/**
 * A text message in a chat. The unique (chat, idMessage) key makes storing a
 * GREEN-API message idempotent, which the notification poller relies on.
 */
@Entity('messages')
@Unique(['chatId', 'idMessage'])
@Index(['chatId', 'sentAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** `Chat.id` (our uuid), not the Telegram chat id. */
  @Column('uuid')
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  /** Message id assigned by GREEN-API. */
  @Column()
  idMessage: string;

  @Column({ type: 'varchar' })
  direction: MessageDirection;

  @Column('text')
  text: string;

  @Column({ type: 'timestamptz' })
  sentAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
