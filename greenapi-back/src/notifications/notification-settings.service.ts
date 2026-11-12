import { Injectable, Logger } from '@nestjs/common';
import { GreenApiClient } from '../green-api/green-api.client.js';
import type {
  GreenApiCredentials,
  GreenApiSettings,
  SetSettingsRequest,
} from '../green-api/green-api.types.js';

/** What the poller needs: notifications go to the HTTP API queue, no webhook. */
const REQUIRED_SETTINGS = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingMessageWebhook: 'yes',
  outgoingWebhook: 'yes',
  stateWebhook: 'yes',
} as const satisfies SetSettingsRequest;

@Injectable()
export class NotificationSettingsService {
  private readonly logger = new Logger(NotificationSettingsService.name);

  constructor(private readonly greenApi: GreenApiClient) {}

  /**
   * Turns on the HTTP API notification queue, but only when something is off:
   * `setSettings` restarts the instance (up to 5 min), which must not happen on
   * every login. Never throws: failures are logged and the caller carries on.
   */
  async ensure(creds: GreenApiCredentials): Promise<void> {
    const id = creds.idInstance;
    try {
      const current = await this.greenApi.getSettings(creds);
      if (settingsAreReady(current)) {
        this.logger.log(`Instance ${id}: notification settings already OK`);
        return;
      }
      await this.greenApi.setSettings(creds, REQUIRED_SETTINGS);
      this.logger.warn(
        `Instance ${id}: notification settings updated via setSettings (instance restarts, up to 5 min)`,
      );
    } catch (err) {
      this.logger.error(
        `Instance ${id}: could not check notification settings: ${(err as Error).message}`,
      );
    }
  }
}

function settingsAreReady(s: GreenApiSettings): boolean {
  return (
    !s.webhookUrl &&
    s.incomingWebhook === 'yes' &&
    s.outgoingMessageWebhook === 'yes' &&
    s.outgoingWebhook === 'yes' &&
    s.stateWebhook === 'yes'
  );
}
