import { queryClient } from '@/shared/config';
import { queryKeys } from './queryKeys';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function messageOf(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body;
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No connection to the server', null);
  }

  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      queryClient.setQueryData(queryKeys.me, null);
    }
    throw new ApiError(response.status, messageOf(data, response.statusText), data);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
};
