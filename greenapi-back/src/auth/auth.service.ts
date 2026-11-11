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
import type { GreenApiCredentials } from '../green-api/green-api.types.js';
import type { Instance } from '../instances/instance.entity.js';
import { InstancesService } from '../instances/instances.service.js';
import { NotificationPollerService } from '../notifications/notification-poller.service.js';
import { NotificationSettingsService } from '../notifications/notification-settings.service.js';
import type { LoginDto } from './login.schema.js';

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
    private readonly notificationSettings: NotificationSettingsService,
    private readonly poller: NotificationPollerService,
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
    // Never fails the login: errors are logged, and the poller re-checks on HTTP 400.
    await this.notificationSettings.ensure(creds);
    await this.signIn.signIn(instance.id, { method: 'green-api' });
    this.poller.start(instance.id);

    this.logger.log(`Instance ${instance.idInstance} logged in`);
    return toInstanceView(instance);
  }

  /**
   * Ends this browser's session; a request without one is not an error. The
   * instance's poller stops on its own once no live session is left.
   */
  async logout(): Promise<void> {
    await this.signIn.signOut();
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
