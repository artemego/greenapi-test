import { Injectable } from '@nestjs/common';
import { filter, map, Subject, type Observable } from 'rxjs';
import type { ChatView } from '../chats/chats.service.js';
import type { InstanceState } from '../green-api/green-api.types.js';
import type { MessageView } from '../messages/messages.service.js';

/** Event name -> payload. Payloads use the same shapes as the REST API. */
export interface AppEventMap {
  /** `chatId` is `Chat.id` (our uuid), as in `/chats/:id/messages`. */
  'message.created': { chatId: string; message: MessageView };
  'chat.created': ChatView;
  'instance.state': { state: InstanceState };
}

export type AppEventType = keyof AppEventMap;

export interface AppEvent<T extends AppEventType = AppEventType> {
  type: T;
  data: AppEventMap[T];
}

interface Envelope {
  instanceId: string;
  event: AppEvent;
}

/**
 * In-process pub/sub between the services that change data and the SSE
 * connections of the instance it belongs to. Single process only, like the
 * poller; several replicas would need Redis pub/sub or similar.
 */
@Injectable()
export class EventBusService {
  private readonly events$ = new Subject<Envelope>();

  emit<T extends AppEventType>(instanceId: string, type: T, data: AppEventMap[T]): void {
    this.events$.next({ instanceId, event: { type, data } as AppEvent });
  }

  /** Events of one instance only. */
  stream(instanceId: string): Observable<AppEvent> {
    return this.events$.pipe(
      filter((envelope) => envelope.instanceId === instanceId),
      map((envelope) => envelope.event),
    );
  }
}
