import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Chat } from '@/entities/chat';
import type { Message, MessageStatus } from '@/entities/message';
import { queryKeys, type Me } from '@/shared/api';
import { receiveMessage, setMessageStatus, touchChat, type MessagePages } from './messagesCache';

const RECONNECT_DELAY_MS = 3000;

type MessageCreatedEvent = { chatId: string; message: Message };
type MessageStatusEvent = { chatId: string; messageId: string; status: MessageStatus };
type InstanceStateEvent = { state: string };

export type ConnectionState = 'connecting' | 'open' | 'reconnecting';

type Unread = Record<string, number>;

function listen<T>(source: EventSource, type: string, handler: (data: T) => void) {
  source.addEventListener(type, (event) => {
    handler(JSON.parse((event as MessageEvent<string>).data) as T);
  });
}

function subscribe(
  source: EventSource,
  queryClient: QueryClient,
  openChatRef: RefObject<string | undefined>,
  addUnread: (chatId: string) => void,
) {
  listen<MessageCreatedEvent>(source, 'message.created', ({ chatId, message }) => {
    queryClient.setQueryData<MessagePages>(
      queryKeys.messages(chatId),
      (data) => data && receiveMessage(data, message),
    );

    const chats = queryClient.getQueryData<Chat[]>(queryKeys.chats);
    if (chats?.some((chat) => chat.id === chatId)) {
      queryClient.setQueryData<Chat[]>(
        queryKeys.chats,
        (current) => current && touchChat(current, chatId, message),
      );
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    }

    if (message.direction === 'incoming' && chatId !== openChatRef.current) addUnread(chatId);
  });

  listen<MessageStatusEvent>(source, 'message.status', ({ chatId, messageId, status }) => {
    queryClient.setQueryData<MessagePages>(
      queryKeys.messages(chatId),
      (data) => data && setMessageStatus(data, messageId, status),
    );
  });

  listen<Chat>(source, 'chat.created', (chat) => {
    queryClient.setQueryData<Chat[]>(queryKeys.chats, (chats) =>
      chats && !chats.some((item) => item.id === chat.id) ? [chat, ...chats] : chats,
    );
  });

  listen<InstanceStateEvent>(source, 'instance.state', ({ state }) => {
    queryClient.setQueryData<Me | null>(queryKeys.me, (me) => me && { ...me, state });
  });
}

export function useLiveEvents(openChatId: string | undefined) {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [unread, setUnread] = useState<Unread>({});
  const [previousOpenChatId, setPreviousOpenChatId] = useState(openChatId);
  const openChatRef = useRef(openChatId);

  if (openChatId !== previousOpenChatId) {
    setPreviousOpenChatId(openChatId);
    if (openChatId && unread[openChatId]) {
      setUnread((current) =>
        Object.fromEntries(Object.entries(current).filter(([chatId]) => chatId !== openChatId)),
      );
    }
  }

  useEffect(() => {
    openChatRef.current = openChatId;
  }, [openChatId]);

  useEffect(() => {
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let connectedBefore = false;
    let disposed = false;

    const addUnread = (chatId: string) =>
      setUnread((current) => ({ ...current, [chatId]: (current[chatId] ?? 0) + 1 }));

    function connect() {
      source = new EventSource('/api/events', { withCredentials: true });

      source.addEventListener('open', () => {
        if (connectedBefore) {
          queryClient.invalidateQueries({ queryKey: queryKeys.chats });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
        connectedBefore = true;
        setConnection('open');
      });

      source.addEventListener('error', () => {
        if (disposed || !source) return;
        setConnection('reconnecting');
        if (source.readyState === EventSource.CLOSED) {
          source.close();
          queryClient.invalidateQueries({ queryKey: queryKeys.me });
          retryTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      });

      subscribe(source, queryClient, openChatRef, addUnread);
    }

    connect();
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [queryClient]);

  return { connection, unread };
}
