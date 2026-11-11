import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GreenApiError } from './green-api.error.js';

const logger = new Logger('GreenApi');

/**
 * Maps a failed GREEN-API call made on behalf of a logged-in instance to the
 * HTTP error our API returns. Non-GreenApiError values are rethrown unchanged.
 * (Login maps 401/403 itself: there they mean "wrong credentials".)
 */
export function toHttpError(err: unknown): never {
  if (!(err instanceof GreenApiError)) throw err;
  logger.warn(err.message);

  if (err.rateLimited) {
    throw new HttpException(
      'GREEN-API rate limit reached for this instance, try again later',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
  if (err.isUnauthorized) {
    throw new BadGatewayException(
      'GREEN-API rejected this instance (token changed or instance deleted), log in again',
    );
  }
  throw new BadGatewayException('GREEN-API request failed, try again later');
}
