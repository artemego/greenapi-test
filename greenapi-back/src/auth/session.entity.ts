import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Instance } from '../instances/instance.entity.js';

/**
 * A browser session, stored for `@nestjs/authentication`. `id` is the SHA-256
 * of the cookie token (the token itself is never stored); `userId` is the
 * instance's id.
 */
@Entity('sessions')
export class Session {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => Instance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  instance: Instance;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz' })
  lastActiveAt: Date;

  @Column({ type: 'varchar', nullable: true })
  mfa: 'pending' | 'verified' | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
