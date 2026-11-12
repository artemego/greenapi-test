import { dayKey, formatDayLabel } from '@/shared/lib';
import type { ChatMessage, MessageDirection } from '../model/types';

const GROUP_GAP_MS = 10 * 60_000;

export type MessageGroup = {
  key: string;
  direction: MessageDirection;
  messages: ChatMessage[];
};

export type MessageDay = {
  key: string;
  label: string;
  groups: MessageGroup[];
};

export function groupMessages(messages: ChatMessage[]): MessageDay[] {
  const days: MessageDay[] = [];

  for (const message of messages) {
    const key = dayKey(message.sentAt);
    let day = days.at(-1);
    if (!day || day.key !== key) {
      day = { key, label: formatDayLabel(message.sentAt), groups: [] };
      days.push(day);
    }

    const group = day.groups.at(-1);
    const previous = group?.messages.at(-1);
    const continuesGroup =
      group &&
      previous &&
      group.direction === message.direction &&
      Date.parse(message.sentAt) - Date.parse(previous.sentAt) < GROUP_GAP_MS;

    if (continuesGroup) group.messages.push(message);
    else day.groups.push({ key: message.id, direction: message.direction, messages: [message] });
  }

  return days;
}
