import { ApiError } from '@/shared/api';
import type { LoginInput } from '../api/useLogin';

export type LoginErrors = Partial<Record<keyof LoginInput | 'form', string>>;

const FIELDS: (keyof LoginInput)[] = ['idInstance', 'apiTokenInstance'];

export function validateLogin({ idInstance, apiTokenInstance }: LoginInput): LoginErrors {
  const errors: LoginErrors = {};
  if (!idInstance) errors.idInstance = 'Enter idInstance';
  else if (!/^\d+$/.test(idInstance)) errors.idInstance = 'idInstance must contain digits only';
  if (!apiTokenInstance) errors.apiTokenInstance = 'Enter apiTokenInstance';
  return errors;
}

function fieldErrors(body: unknown): LoginErrors {
  const messages =
    body && typeof body === 'object' && 'message' in body && Array.isArray(body.message)
      ? (body.message as unknown[])
      : [];
  const errors: LoginErrors = {};
  for (const message of messages) {
    if (typeof message !== 'string') continue;
    const field = FIELDS.find((name) => message.startsWith(`${name}:`));
    if (field) errors[field] = message.slice(field.length + 1).trim();
    else errors.form = message;
  }
  return errors;
}

function instanceState(body: unknown) {
  return body && typeof body === 'object' && 'state' in body ? String(body.state) : 'unknown';
}

export function toLoginErrors(error: unknown): LoginErrors {
  if (!(error instanceof ApiError)) return { form: 'Something went wrong, try again' };

  switch (error.status) {
    case 400:
      return fieldErrors(error.body);
    case 401:
      return { apiTokenInstance: 'Wrong idInstance or apiTokenInstance' };
    case 409:
      return {
        form: `Instance is not authorized (state: ${instanceState(error.body)}). Link it to Telegram in the GREEN-API console.`,
      };
    case 0:
      return { form: 'No connection to the server' };
    default:
      return { form: 'GREEN-API is unavailable, try again later' };
  }
}
