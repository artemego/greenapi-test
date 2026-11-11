import {
  BadGatewayException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignInService } from '@nestjs/authentication';
import type { AppConfigService } from '../config/env.js';
import { GreenApiClient } from '../green-api/green-api.client.js';
import { GreenApiError } from '../green-api/green-api.error.js';
import type {
  GreenApiCredentials,
  GreenApiSettings,
  SetSettingsRequest,
} from '../green-api/green-api.types.js';
import type { Instance } from '../instances/instance.entity.js';
import { InstancesService } from '../instances/instances.service.js';
import type { LoginDto } from './login.schema.js';

/** Notification settings the poller (step 6) needs: HTTP API queue, no webhook. */
const REQUIRED_SETTINGS = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingMessageWebhook: 'yes',
  stateWebhook: 'yes',
} as const satisfies SetSettingsRequest;

export interface InstanceView {
  idInstance: string;
  state: string;
}

export function toInstanceView(instance: Instance): InstanceView {
  return { idInstance: instance.idInstance, state: instance.state };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly greenApi: GreenApiClient,
    private readonly instances: InstancesService,
    private readonly signIn: SignInService,
    @Inject(ConfigService) private readonly config: AppConfigService,
  ) {}

  async login(dto: LoginDto): Promise<InstanceView> {
    const creds: GreenApiCredentials = {
      apiUrl: dto.apiUrl ?? this.config.get('GREEN_API_URL', { infer: true }),
      idInstance: dto.idInstance,
      apiTokenInstance: dto.apiTokenInstance,
    };

    const { stateInstance } = await this.callGreenApi(() =>
      this.greenApi.getStateInstance(creds),
    );
    if (stateInstance !== 'authorized') {
      throw new ConflictException({
        statusCode: 409,
        message: `Instance is not authorized in GREEN-API (state: ${stateInstance})`,
        state: stateInstance,
      });
    }

    const instance = await this.instances.upsertByIdInstance(creds, stateInstance);
    await this.ensureNotificationSettings(creds, instance.idInstance);
    await this.signIn.signIn(instance.id, { method: 'green-api' });

    this.logger.log(`Instance ${instance.idInstance} logged in`);
    return toInstanceView(instance);
  }

  /** Ends this browser's session; a request without one is not an error. */
  async logout(): Promise<void> {
    await this.signIn.signOut();
  }

  /**
   * Turns on the HTTP API notification queue, but only when something is off:
   * `setSettings` restarts the instance, which must not happen on every login.
   * Failures are logged, not thrown: the login itself is valid either way, and
   * the poller re-checks the settings when the queue refuses to work.
   */
  private async ensureNotificationSettings(
    creds: GreenApiCredentials,
    idInstance: string,
  ): Promise<void> {
    try {
      const current = await this.greenApi.getSettings(creds);
      if (settingsAreReady(current)) {
        this.logger.log(`Instance ${idInstance}: notification settings already OK`);
        return;
      }
      await this.greenApi.setSettings(creds, REQUIRED_SETTINGS);
      this.logger.warn(
        `Instance ${idInstance}: notification settings updated via setSettings (instance restarts, up to 5 min)`,
      );
    } catch (err) {
      this.logger.error(
        `Instance ${idInstance}: could not check notification settings: ${(err as Error).message}`,
      );
    }
  }

  /** Maps GREEN-API failures to HTTP errors for the login route. */
  private async callGreenApi<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (err) {
      if (!(err instanceof GreenApiError)) throw err;
      // A wrong idInstance or token comes back as 400/401/403 (or 404 for an unknown instance).
      if (err.isUnauthorized || err.status === 400 || err.status === 404) {
        throw new UnauthorizedException('Invalid idInstance or apiTokenInstance');
      }
      this.logger.warn(err.message);
      throw new BadGatewayException('GREEN-API is unavailable, try again later');
    }
  }
}

function settingsAreReady(s: GreenApiSettings): boolean {
  return (
    !s.webhookUrl &&
    s.incomingWebhook === 'yes' &&
    s.outgoingMessageWebhook === 'yes' &&
    s.stateWebhook === 'yes'
  );
}
