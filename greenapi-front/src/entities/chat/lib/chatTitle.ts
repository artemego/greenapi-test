import { formatPhone } from '@/shared/lib';
import type { Chat } from '../model/types';

export function chatTitle(chat: Chat) {
  if (chat.name) return chat.name;
  if (chat.phoneNumber) return formatPhone(chat.phoneNumber);
  return chat.chatId;
}

export function chatSubtitle(chat: Chat) {
  if (chat.name && chat.phoneNumber) return formatPhone(chat.phoneNumber);
  return 'Telegram';
}
