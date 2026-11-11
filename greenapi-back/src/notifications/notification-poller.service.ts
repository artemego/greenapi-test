import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
import { GreenApiClient } from '../green-api/green-api.client.js';
import { GreenApiError } from '../green-api/green-api.error.js';
import { InstancesService } from '../instances/instances.service.js';
import { NotificationHandler } from './notification.handler.js';
import { NotificationSettingsService } from './notification-settings.service.js';

/** How long one receiveNotification call waits for a notification (GREEN-API allows 5..60). */
const RECEIVE_TIMEOUT_SEC = 20;
const BACKOFF_START_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
/** Pause after fixing settings: setSettings restarts the instance. */
const SETTINGS_RETRY_MS = 60_000;

interface Loop {
  controller: AbortController;
  done: Promise<void>;
}

/**
 * One long-poll loop per logged-in instance:
 * receiveNotification -> handler -> deleteNotification.
 *
 * A loop stops by itself when the instance has no live session left (logout,
 * expiry) or GREEN-API rejects its token. Assumes a single backend process:
 * several replicas would poll the same queue (would need `@nestjs/locks`).
 */
@Injectable()
export class NotificationPollerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(NotificationPollerService.name);
  private readonly loops = new Map<string, Loop>();

  constructor(
    private readonly greenApi: GreenApiClient,
    private readonly instances: InstancesService,
    private readonly handler: NotificationHandler,
    private readonly settings: NotificationSettingsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const ids = await this.instances.findIdsWithLiveSessions();
    for (const id of ids) this.start(id);
    this.logger.log(`Resumed polling for ${ids.length} instance(s)`);
  }

  async onModuleDestroy(): Promise<void> {
    const loops = [...this.loops.values()];
    for (const loop of loops) loop.controller.abort();
    await Promise.allSettled(loops.map((loop) => loop.done));
  }

  /** Starts polling for an instance; does nothing if it is already being polled. */
  start(instanceId: string): void {
    if (this.loops.has(instanceId)) return;
    const controller = new AbortController();
    const loop: Loop = {
      controller,
      done: this.run(instanceId, controller.signal)
        .catch((err: unknown) =>
          this.logger.error(`Poller for ${instanceId} crashed: ${(err as Error).message}`),
        )
        .finally(() => {
          if (this.loops.get(instanceId) === loop) this.loops.delete(instanceId);
        }),
    };
    this.loops.set(instanceId, loop);
  }

  stop(instanceId: string): void {
    this.loops.get(instanceId)?.controller.abort();
  }

  private async run(instanceId: string, signal: AbortSignal): Promise<void> {
    this.logger.log(`Polling started for instance ${instanceId}`);
    let backoff = BACKOFF_START_MS;

    while (!signal.aborted) {
      // Read every round: a re-login may have stored a new token or apiUrl.
      const creds = await this.instances.findWithToken(instanceId);
      if (!creds || !(await this.instances.hasLiveSession(instanceId))) {
        this.logger.log(`Polling stopped for instance ${instanceId}: no live session`);
        return;
      }

      let notification;
      try {
        notification = await this.greenApi.receiveNotification(creds, RECEIVE_TIMEOUT_SEC, signal);
        backoff = BACKOFF_START_MS;
      } catch (err) {
        if (signal.aborted) return;
        if (err instanceof GreenApiError && err.isUnauthorized) {
          this.logger.warn(`Instance ${creds.idInstance}: token rejected, polling stopped`);
          await this.instances.setState(instanceId, 'notAuthorized');
          // TODO(step 7): emit `instance.state`.
          return;
        }
        if (err instanceof GreenApiError && err.status === 400) {
          // Typically "custom webhook url is set": the queue is off until settings are fixed.
          this.logger.warn(`Instance ${creds.idInstance}: ${err.message}; re-checking settings`);
          await this.settings.ensure(creds);
          await this.pause(SETTINGS_RETRY_MS, signal);
          continue;
        }
        this.logger.warn(
          `Instance ${creds.idInstance}: ${(err as Error).message}; retrying in ${backoff / 1000}s`,
        );
        await this.pause(backoff, signal);
        backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
        continue;
      }

      if (!notification) continue; // queue stayed empty for RECEIVE_TIMEOUT_SEC

      try {
        await this.handler.handle(instanceId, notification.body);
      } catch (err) {
        // Deleted anyway below: one bad notification must not block the FIFO queue.
        this.logger.error(
          `Instance ${creds.idInstance}: failed to handle notification ${notification.receiptId}: ${(err as Error).message}`,
        );
      }

      try {
        await this.greenApi.deleteNotification(creds, notification.receiptId);
      } catch (err) {
        // It will be received again; handling is idempotent, so that is safe.
        this.logger.warn(
          `Instance ${creds.idInstance}: deleteNotification failed: ${(err as Error).message}`,
        );
        await this.pause(backoff, signal);
        backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
      }
    }
  }

  /** Sleeps unless the loop is aborted first (then resolves early). */
  private async pause(ms: number, signal: AbortSignal): Promise<void> {
    await sleep(ms, undefined, { signal }).catch(() => undefined);
  }
}
