import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import type { Instance } from '../instances/instance.entity.js';

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: Instance;
    sessionExtra: { user: Instance };
  }
}

/**
 * Cookie-session credential provider: the global guard runs it on every
 * request. The instance arrives already joined by `TypeOrmSessionStore`.
 */
@Injectable()
export class SessionAuth extends SessionCookieProvider<Instance> {
  constructor(registry: AuthenticationRegistry) {
    super();
    registry.registerProvider(this);
  }

  protected validate(session: SessionRecord): Instance | null {
    return session.extra?.user ?? null;
  }
}
