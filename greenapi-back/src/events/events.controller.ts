import { Controller, Header, type MessageEvent, Sse } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { interval, map, merge, startWith, type Observable } from 'rxjs';
import type { Instance } from '../instances/instance.entity.js';
import { EventBusService } from './event-bus.service.js';

/** A comment line now and then keeps proxies from closing an idle connection. */
const HEARTBEAT_MS = 25_000;

/**
 * A comment-only event (`: text`). `data` must stay undefined: Nest then writes
 * no `data:` line and no id, so `EventSource` dispatches nothing. The cast is
 * needed because `MessageEvent` types `data` as required.
 */
const comment = (text: string): MessageEvent => ({ comment: text }) as MessageEvent;

@Controller('events')
export class EventsController {
  constructor(private readonly bus: EventBusService) {}

  /**
   * Live updates for the logged-in instance (`message.created`, `chat.created`,
   * `instance.state`). No replay: after a reconnect the client refetches
   * `/chats` and the open chat's messages.
   */
  @Sse()
  @Header('X-Accel-Buffering', 'no') // nginx: don't buffer the stream
  stream(@CurrentUser() instance: Instance): Observable<MessageEvent> {
    const events = this.bus
      .stream(instance.id)
      .pipe(map((event): MessageEvent => ({ type: event.type, data: event.data })));
    const heartbeat = interval(HEARTBEAT_MS).pipe(
      map(() => comment('heartbeat')),
    );
    // The first comment makes the response start right away, so clients see the connection open.
    return merge(events, heartbeat).pipe(
      startWith(comment('connected')),
    );
  }
}
