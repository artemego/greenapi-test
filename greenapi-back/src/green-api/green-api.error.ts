/**
 * Failure of a GREEN-API call. `status` is the HTTP status, or 0 for network
 * errors and timeouts. The message names the API method only: request URLs
 * contain the instance token and must never end up in errors or logs.
 */
export class GreenApiError extends Error {
  override readonly name = 'GreenApiError';

  constructor(
    readonly method: string,
    readonly status: number,
    detail: string,
    readonly rateLimited = status === 429 || status === 469,
  ) {
    super(`GREEN-API ${method} failed (${status || 'network'}): ${detail}`);
  }

  /** Credentials rejected (wrong idInstance / apiTokenInstance). */
  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** Worth retrying later: network failure, timeout, or upstream 5xx. */
  get isTransient(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}
