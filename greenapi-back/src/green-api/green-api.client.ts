import { Injectable, Logger } from '@nestjs/common';
import { GreenApiError } from './green-api.error.js';
import type {
  CheckAccountResponse,
  DeleteNotificationResponse,
  GreenApiCredentials,
  GreenApiSettings,
  NotificationBody,
  ReceivedNotification,
  SendMessageResponse,
  SetSettingsRequest,
  SetSettingsResponse,
  StateInstanceResponse,
} from './green-api.types.js';

const DEFAULT_TIMEOUT_MS = 15_000;
/** Extra time on top of `receiveTimeout` before the HTTP request itself gives up. */
const LONG_POLL_GRACE_MS = 10_000;
const KNOWN_WEBHOOK_TYPES = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'stateInstanceChanged',
]);

interface RequestOptions {
  httpMethod?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** Appended after the token, e.g. the receiptId of deleteNotification. */
  pathSuffix?: string;
  query?: Record<string, string | number>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Stateless HTTP client for GREEN-API (Telegram). Credentials are passed per call.
 * URLs carry the token, so only the method name is ever logged or put in errors.
 */
@Injectable()
export class GreenApiClient {
  private readonly logger = new Logger(GreenApiClient.name);

  getStateInstance(creds: GreenApiCredentials): Promise<StateInstanceResponse> {
    return this.request(creds, 'getStateInstance');
  }

  getSettings(creds: GreenApiCredentials): Promise<GreenApiSettings> {
    return this.request(creds, 'getSettings');
  }

  /** Note: applying settings restarts the instance (up to 5 minutes). */
  setSettings(
    creds: GreenApiCredentials,
    settings: SetSettingsRequest,
  ): Promise<SetSettingsResponse> {
    return this.request(creds, 'setSettings', { httpMethod: 'POST', body: settings });
  }

  /**
   * Resolves a phone number (digits only) to a Telegram chatId.
   * Rate limiting arrives as HTTP 469, or as HTTP 200 with `rate_limit_exceeded`;
   * both throw a GreenApiError with `rateLimited: true`.
   */
  async checkAccount(
    creds: GreenApiCredentials,
    phoneNumber: string,
  ): Promise<CheckAccountResponse> {
    const method = 'checkAccount';
    const data = await this.request<unknown>(creds, method, {
      httpMethod: 'POST',
      body: { phoneNumber: Number(phoneNumber) },
    });
    if (JSON.stringify(data ?? null).includes('rate_limit_exceeded')) {
      throw new GreenApiError(method, 200, 'rate_limit_exceeded', true);
    }
    if (!isObject(data) || typeof data.exist !== 'boolean') {
      throw new GreenApiError(method, 200, 'unexpected response');
    }
    return data as unknown as CheckAccountResponse;
  }

  sendMessage(
    creds: GreenApiCredentials,
    chatId: string,
    message: string,
  ): Promise<SendMessageResponse> {
    return this.request(creds, 'sendMessage', {
      httpMethod: 'POST',
      body: { chatId, message },
    });
  }

  /**
   * Long-polls the notification queue. Resolves to `null` when the queue stays
   * empty for `receiveTimeoutSec` (5..60). Aborting `signal` rejects with the
   * signal's AbortError, not a GreenApiError.
   */
  async receiveNotification(
    creds: GreenApiCredentials,
    receiveTimeoutSec: number,
    signal?: AbortSignal,
  ): Promise<ReceivedNotification | null> {
    const data = await this.request<unknown>(creds, 'receiveNotification', {
      query: { receiveTimeout: receiveTimeoutSec },
      timeoutMs: receiveTimeoutSec * 1000 + LONG_POLL_GRACE_MS,
      signal,
    });
    if (!isObject(data) || typeof data.receiptId !== 'number' || !isObject(data.body)) {
      return null;
    }
    return { receiptId: data.receiptId, body: normalizeBody(data.body) };
  }

  deleteNotification(
    creds: GreenApiCredentials,
    receiptId: number,
  ): Promise<DeleteNotificationResponse> {
    return this.request(creds, 'deleteNotification', {
      httpMethod: 'DELETE',
      pathSuffix: String(receiptId),
    });
  }

  private async request<T>(
    creds: GreenApiCredentials,
    method: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    const { httpMethod = 'GET', body, pathSuffix, query, signal } = opts;
    const url = new URL(
      [
        creds.apiUrl.replace(/\/+$/, ''),
        `waInstance${encodeURIComponent(creds.idInstance)}`,
        method,
        encodeURIComponent(creds.apiTokenInstance),
        ...(pathSuffix ? [encodeURIComponent(pathSuffix)] : []),
      ].join('/'),
    );
    for (const [key, value] of Object.entries(query ?? {})) {
      url.searchParams.set(key, String(value));
    }

    const timeout = AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const started = Date.now();

    let res: Response;
    let text: string;
    try {
      res = await fetch(url, {
        method: httpMethod,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
      text = await res.text();
    } catch (err) {
      if (signal?.aborted) throw err; // caller cancelled: let them see their own abort
      const detail = timeout.aborted ? 'timeout' : 'network error';
      throw new GreenApiError(method, 0, detail);
    }

    this.logger.debug(`${method} ${res.status} in ${Date.now() - started}ms`);

    if (!res.ok) {
      throw new GreenApiError(method, res.status, text.slice(0, 200) || res.statusText);
    }
    if (!text.trim()) return null as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new GreenApiError(method, res.status, 'invalid JSON in response');
    }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeBody(raw: Record<string, unknown>): NotificationBody {
  const type = typeof raw.typeWebhook === 'string' ? raw.typeWebhook : '';
  if (KNOWN_WEBHOOK_TYPES.has(type)) return raw as unknown as NotificationBody;
  return { typeWebhook: 'unknown', originalType: type };
}
