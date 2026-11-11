import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AuthenticationStorage,
  type SessionRecord,
  type SessionStore,
} from '@nestjs/authentication';
import { LessThan, Repository } from 'typeorm';
import { Session } from './session.entity.js';

/** Keeps `@nestjs/authentication` sessions in Postgres, so logins survive restarts. */
@Injectable()
export class TypeOrmSessionStore implements SessionStore {
  constructor(
    @InjectRepository(Session) private readonly repo: Repository<Session>,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ sessions: this });
  }

  /** Loads the instance in the same query, for `SessionAuth.validate()`. */
  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.repo.findOne({ where: { id }, relations: { instance: true } });
    if (!row) return undefined;
    return { ...toRecord(row), extra: { user: row.instance } };
  }

  async createSession(record: SessionRecord): Promise<void> {
    // Keep the table bounded: a new session is a good moment to drop expired ones.
    await this.repo.delete({ expiresAt: LessThan(new Date()) });
    await this.repo.insert({
      id: record.id,
      userId: record.userId,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      lastActiveAt: record.lastActiveAt,
      mfa: record.mfa ?? null,
      // jsonb: TypeORM's insert type can't map `unknown` values, the data is plain JSON.
      metadata: (record.metadata as Record<string, any> | undefined) ?? null,
    });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    // One conditional write, so a touch can never resurrect a deleted session.
    await this.repo.update({ id, lastActiveAt: LessThan(lastActiveAt) }, { lastActiveAt });
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.repo.find({ where: { userId } });
    return rows.map(toRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }
}

function toRecord(row: Session): SessionRecord {
  return {
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    lastActiveAt: row.lastActiveAt,
    // Optional fields come back absent, never null (store contract).
    ...(row.mfa ? { mfa: row.mfa } : {}),
    ...(row.metadata ? { metadata: row.metadata } : {}),
  };
}
