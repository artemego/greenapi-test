import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Chat } from '@/entities/chat';
import type { Message } from '@/entities/message';
import { api, queryKeys } from '@/shared/api';
import {
  resolveLocalMessage,
  setMessageStatus,
  touchChat,
  upsertMessage,
  type MessagePages,
} from '../model/messagesCache';

type SendVariables = {
  text: string;
  localId: string;
};

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();
  const messagesKey = queryKeys.messages(chatId);

  return useMutation({
    mutationFn: ({ text }: SendVariables) =>
      api.post<Message>(`/chats/${chatId}/messages`, { text }),
    onMutate: ({ text, localId }) => {
      queryClient.setQueryData<MessagePages>(
        messagesKey,
        (data) =>
          data &&
          upsertMessage(data, {
            id: localId,
            direction: 'outgoing',
            text,
            sentAt: new Date().toISOString(),
            status: 'sending',
            local: true,
          }),
      );
    },
    onSuccess: (message, { localId }) => {
      queryClient.setQueryData<MessagePages>(
        messagesKey,
        (data) => data && resolveLocalMessage(data, localId, message),
      );
      queryClient.setQueryData<Chat[]>(
        queryKeys.chats,
        (chats) => chats && touchChat(chats, chatId, message),
      );
    },
    onError: (_error, { localId }) => {
      queryClient.setQueryData<MessagePages>(
        messagesKey,
        (data) => data && setMessageStatus(data, localId, 'failed'),
      );
    },
  });
}
