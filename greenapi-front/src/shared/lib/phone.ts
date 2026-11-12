import { AsYouType, isPossiblePhoneNumber, type CountryCode } from 'libphonenumber-js';

export const PHONE_MAX_DIGITS = 15;

export function phoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatPhone(digits: string) {
  return digits ? new AsYouType().input(`+${digits}`) : '';
}

export function phoneCountry(digits: string): CountryCode | undefined {
  if (!digits) return undefined;
  const formatter = new AsYouType();
  formatter.input(`+${digits}`);
  return formatter.getCountry();
}

export function isPossiblePhone(digits: string) {
  return isPossiblePhoneNumber(`+${digits}`);
}
