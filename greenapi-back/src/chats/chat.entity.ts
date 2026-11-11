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
import { Instance } from '../instances/instance.entity.js';

/** A personal Telegram chat of an instance, keyed by GREEN-API's numeric `chatId`. */
@Entity('chats')
@Unique(['instanceId', 'chatId'])
@Index(['instanceId', 'phoneNumber'])
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  instanceId: string;

  @ManyToOne(() => Instance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  /** Telegram chat id from GREEN-API, e.g. "10000000". */
  @Column()
  chatId: string;

  /** Digits only. Null for chats that started with an incoming message without a phone. */
  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
