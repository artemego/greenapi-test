import type { InfiniteData } from '@tanstack/react-query';
import type { Chat } from '@/entities/chat';
import type { ChatMessage, LocalStatus, Message } from '@/entities/message';

export type MessagePages = InfiniteData<ChatMessage[], string | undefined>;

export function flattenPages(data: { pages: ChatMessage[][] } | undefined): ChatMessage[] {
  if (!data) return [];
  const seen = new Set<string>();
  const result: ChatMessage[] = [];
  for (const page of [...data.pages].reverse()) {
    for (const message of page) {
      if (seen.has(message.id)) continue;
      seen.add(message.id);
      result.push(message);
    }
  }
  return result;
}

function hasMessage(data: MessagePages, id: string) {
  return data.pages.some((page) => page.some((message) => message.id === id));
}

function mapMessages(
  data: MessagePages,
  update: (message: ChatMessage) => ChatMessage | null,
): MessagePages {
  return {
    ...data,
    pages: data.pages.map((page) =>
      page.flatMap((message) => {
        const next = update(message);
        return next ? [next] : [];
      }),
    ),
  };
}

export function appendMessage(data: MessagePages, message: ChatMessage): MessagePages {
  if (hasMessage(data, message.id)) return data;
  const [newest = [], ...older] = data.pages;
  return { ...data, pages: [[...newest, message], ...older] };
}

export function upsertMessage(data: MessagePages, message: ChatMessage): MessagePages {
  if (!hasMessage(data, message.id)) return appendMessage(data, message);
  return mapMessages(data, (item) => (item.id === message.id ? message : item));
}

export function resolveLocalMessage(
  data: MessagePages,
  localId: string,
  message: Message,
): MessagePages {
  const alreadyStored = hasMessage(data, message.id);
  return mapMessages(data, (item) => {
    if (item.id !== localId) return item;
    return alreadyStored ? null : message;
  });
}

export function setLocalStatus(
  data: MessagePages,
  localId: string,
  status: LocalStatus,
): MessagePages {
  return mapMessages(data, (item) => (item.id === localId ? { ...item, status } : item));
}

export function removeMessage(data: MessagePages, id: string): MessagePages {
  return mapMessages(data, (item) => (item.id === id ? null : item));
}

export function touchChat(chats: Chat[], chatId: string, message: Message): Chat[] {
  const chat = chats.find((item) => item.id === chatId);
  if (!chat) return chats;
  return [
    { ...chat, lastMessage: message.text, lastMessageAt: message.sentAt },
    ...chats.filter((item) => item.id !== chatId),
  ];
}
