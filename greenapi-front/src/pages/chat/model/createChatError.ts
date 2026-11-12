import { ApiError } from '@/shared/api';

export function createChatError(error: unknown) {
  if (!(error instanceof ApiError)) return 'Something went wrong, try again';

  switch (error.status) {
    case 400:
      return 'Enter 7 to 15 digits';
    case 404:
      return 'No Telegram account with this number';
    case 429:
      return 'Too many requests, try again in a moment';
    case 0:
      return 'No connection to the server';
    default:
      return 'GREEN-API request failed, try again later';
  }
}
