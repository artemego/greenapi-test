import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { InstanceState } from '../green-api/green-api.types.js';

/**
 * A GREEN-API instance someone has logged in with. It is the "user" of the
 * app: sessions, chats and messages all belong to an instance.
 */
@Entity('instances')
export class Instance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  idInstance: string;

  /** Never loaded unless asked for explicitly: see `InstancesService.findWithToken`. */
  @Column({ select: false })
  apiTokenInstance: string;

  @Column()
  apiUrl: string;

  @Column({ type: 'varchar' })
  state: InstanceState;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
